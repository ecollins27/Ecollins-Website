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
    value: str
    pretty_render: bool

    def __init__(self, value, pretty_render=True):
        self.value = value
        self.pretty_render = pretty_render

@dataclass
class TerminalLine:
    input: str
    output: str
    num: int
    path: str
    pretty_render: bool

    def __init__(self, input: str, output: str, num: int, path="/", pretty_render=True):
        self.input = input
        self.output = output
        self.num = num
        self.path = path
        self.pretty_render = pretty_render

def increment_counter():
    while os.path.exists('visits.lock'):
        pass
    with open('visits.lock', 'w') as f:
        f.write('lock')
    with open('visits.txt', 'r') as f:
        visits = int(f.read())
    with open('visits.txt', 'w') as f:
        f.write(str(visits + 1))
    os.remove('visits.lock')

def get_visits():
    with open('visits.txt', 'r') as f:
        return int(f.read())

def parseFile(filename: str):
    filename = BASE_DIR + "/" + filename
    with open(filename, 'r') as f:
        return f.read()

neofetch_str = parseFile("static/home/home.txt")
neofetch_object = {"output": neofetch_str}

all_pages = {}
pretty_extensions = ['.txt']
text_extensions = [".txt", ".css", ".html", ".js", ".raw", ".py", ".wsgi"]
def get_all_pages(dir_path):
    for file in os.listdir(f"{BASE_DIR}/{dir_path}"):
        if (os.path.isdir(f"{BASE_DIR}/{dir_path}/{file}")):
            get_all_pages(f"{dir_path}/{file}")
        elif not all([not file.endswith(extension) for extension in text_extensions]):
            value = parseFile(f"{dir_path}/{file}")
            all_pages[f"{dir_path[11:]}/{file}"] = NanoContent(value=value, pretty_render=any([file.endswith(extension) for extension in pretty_extensions]))
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

@app.route("/pages/hosting/hosting.txt-cat", methods=['GET'])
def get_hosting():
    text = all_pages['/pages/hosting/hosting.txt']
    fastfetch = all_pages['/pages/hosting/al-fastfetch.txt']
    lines = [TerminalLine(input="cat hosting.txt", output=text.value, num=0, path='/pages/hosting')]
    lines.append(TerminalLine(input="ssh pages@al fastfetch", output=fastfetch.value, num=1, path='/pages/hosting'))
    return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path='/pages/hosting', lines=lines)

@app.route('/<path:path>', methods=['GET'])
def get_page(path):
    display_type = ""
    isFile = False
    exit_code = 200
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
        print(f"{BASE_DIR}/static/pages/{path} does not exist")
        display_type = random.sample(['cat', 'nano', 'man'], 1)[0]
        path = f".misc/404.txt"
        isFile = True
        exit_code = 404
    path = '/' + path
    if isFile:
        directory_path = '/'.join(path.split('/')[:-1])
        page = path.split("/")[-1]
        lookup = all_pages[path]
        if display_type == 'cat':
            lines = [TerminalLine(input=f"cat {page}", output=lookup.value, num=0, path=directory_path, pretty_render=lookup.pretty_render)]
            return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=directory_path, lines=lines), exit_code
        elif display_type == 'nano':
            return render_template('nano.html', visits=get_visits(), file=path, content=lookup), exit_code
        elif display_type == 'man':
            lines = [TerminalLine(input=f"man {page[:-4]}", output=lookup.value, num=0, path=directory_path, pretty_render=lookup.pretty_render)]
            return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=directory_path, lines=lines), exit_code
        else:
            return
    else:
        return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=path, lines=[]), exit_code

@app.route('/', methods=['GET'])
def get_home():
    output = parseFile(f"static/home/home.txt")
    lines = [TerminalLine(input="neofetch", output=output, num=0, path='/')]
    increment_counter()
    return render_template('terminal.html', visits=get_visits(), path='/', all_pages=all_pages, lines=lines), 200
# stockholm


if __name__ == '__main__':
    # from waitress import serve
    # serve(app,host='0.0.0.0',port=8080)
    # gunicorn -w 4 'web_printer:app' -b '0.0.0.0:8080'
    app.run(host='0.0.0.0', port=5000,debug=False)