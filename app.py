import argparse
import logging
import os
from dataclasses import dataclass
import math
import random

from flask import Flask, request, redirect, url_for, render_template
app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@dataclass
class NanoContent:
    colors: dict
    value: str

@dataclass
class TerminalLine:
    input: str
    output: str
    num: int
    colors: dict
    images: list
    path: str

    def __init__(self, input: str, output: str, num: int, colors={}, images=[], path="/"):
        self.input = input
        self.output = output
        self.num = num
        self.colors = colors
        self.images = images
        self.path = path

def parseFile(filename: str):
    filename = BASE_DIR + "/" + filename
    with open(filename, 'r') as f:
        data = f.read()
    colors = {}
    counter = 0
    current_color = None
    output = ""
    while len(data) > 0:
        character = data[0]
        if character == '<':
            if current_color == None:
                current_color = data[1:8]
                data = data[9:]
            else:
                current_color = None
                data = data[2:]
        else:
            output += character
            if not current_color is None:
                colors[counter] = current_color
            counter += 1
            data = data[1:]
    return output, colors

neofetch_str, neofetch_colors = parseFile("static/home/home.txt")
neofetch_object = {"output": neofetch_str, "colors": neofetch_colors}

all_pages = {}
def get_all_pages(dir_path):
    for file in os.listdir(f"{BASE_DIR}/{dir_path}"):
        if (os.path.isdir(f"{BASE_DIR}/{dir_path}/{file}")):
            get_all_pages(f"{dir_path}/{file}")
        elif file.endswith('.txt'):
            value, colors = parseFile(f"{dir_path}/{file}")
            all_pages[f"{dir_path[11:]}/{file}"] = NanoContent(value=value, colors=colors)
    return all_pages

def generateManifest(dir_path) -> str:
    string = "{"
    for file in os.listdir(f"{BASE_DIR}/{dir_path}"):
        if os.path.isdir(f"{BASE_DIR}/{dir_path}/{file}"):
            string += "\"" + file + "\": " + generateManifest(f"{dir_path}/{file}")
        else:
            string += "\"" + file + "\": {}"
        string += ","
    return string[:-1] + "}"

with open(f"{BASE_DIR}/static/manifest.json", 'w') as f:
    f.write(generateManifest("static/home"))
get_all_pages("static/home")

@app.route("/crash", methods=['GET'])
def crash():
    pass

@app.route("/hosting/hosting.txt-cat", methods=['GET'])
def get_hosting():
    text = all_pages['/hosting/hosting.txt']
    fastfetch = all_pages['/hosting/al-fastfetch.txt']
    lines = [TerminalLine(input="cat hosting.txt", output=text.value, colors=text.colors, num=0, path='/hosting')]
    lines.append(TerminalLine(input="ssh root@al fastfetch", output=fastfetch.value, colors=fastfetch.colors, num=1, path='/hosting'))
    return render_template('terminal.html', neofetch=neofetch_object, all_pages=all_pages, path='/hosting', lines=lines)

@app.route('/<path:path>', methods=['GET'])
def get_page(path):
    display_type = ""
    isFile = False
    if path.endswith("-nano"):
        display_type = "nano"
        path = path[:-5]
        isFile = True
    elif path.endswith("-cat"):
        display_type = "cat"
        path = path[:-4]
        isFile = True
    elif path.endswith("-man"):
        display_type = "man"
        path = path[:-4]
        isFile = True
    if not os.path.exists(BASE_DIR + f"/static/home/{path}"):
        print(f"{BASE_DIR}/static/home/{path} does not exist")
        display_type = random.sample(['cat', 'nano', 'man'], 1)[0]
        path = f".misc/404.txt"
        isFile = True
    path = '/' + path
    if isFile:
        directory_path = '/'.join(path.split('/')[:-1])
        page = path.split("/")[-1]
        lookup = all_pages[path]
        if display_type == 'cat':
            lines = [TerminalLine(input=f"cat {page}", output=lookup.value, colors=lookup.colors, num=0, path=directory_path)]
            return render_template('terminal.html', all_pages=all_pages, path=directory_path, lines=lines)
        elif display_type == 'nano':
            return render_template('nano.html', file=path, content=lookup)
        elif display_type == 'man':
            lines = [TerminalLine(input=f"man {page[:-4]}", output=lookup.value, colors=lookup.colors, num=0, path=directory_path)]
            return render_template('terminal.html', all_pages=all_pages, path=directory_path, lines=lines)
        else:
            return
    else:
        return render_template('terminal.html', all_pages=all_pages, path=path, lines=[])

@app.route('/', methods=['GET'])
def get_home():
    output, colors = parseFile(f"static/home/home.txt")
    lines = [TerminalLine(input="neofetch", output=output, colors=colors, num=0, path='/')]
    return render_template('terminal.html', neofetch=neofetch_object, all_pages=all_pages, lines=lines)


if __name__ == '__main__':
    # from waitress import serve
    # serve(app,host='0.0.0.0',port=8080)
    # gunicorn -w 4 'web_printer:app' -b '0.0.0.0:8080'
    app.run(host='0.0.0.0', port=5000,debug=False)