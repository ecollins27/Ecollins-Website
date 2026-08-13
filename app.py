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
    while os.path.exists(f'{BASE_DIR}/visits.lock'):
        pass
    with open(f'{BASE_DIR}/visits.lock', 'w') as f:
        f.write('lock')
    with open(f'{BASE_DIR}/visits.txt', 'r') as f:
        visits = int(f.read())
    with open(f'{BASE_DIR}/visits.txt', 'w') as f:
        f.write(str(visits + 1))
    os.remove(f'{BASE_DIR}/visits.lock')

def get_visits():
    with open(f'{BASE_DIR}/visits.txt', 'r') as f:
        return int(f.read())

def parseFile(filename: str):
    filename = BASE_DIR + "/" + filename
    with open(filename, 'r') as f:
        return f.read()

all_pages = {}
pretty_extensions = ['.txt']
text_extensions = [".txt", ".css", ".html", ".js", ".raw", ".py", ".wsgi"]
text_display_types = ["cat", "nano", "man"]
executable_extensions = [".bin", ".sh"]
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

@app.route("/pages/hosting/hosting.txt", methods=['GET'])
def get_hosting():
    text = all_pages['/pages/hosting/hosting.txt']
    fastfetch = all_pages['/pages/hosting/al-fastfetch.txt']
    lines = [TerminalLine(input="cat hosting.txt", output=text.value, num=0, path='/pages/hosting')]
    lines.append(TerminalLine(input="ssh pages@al fastfetch", output=fastfetch.value, num=1, path='/pages/hosting'))
    return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path='/pages/hosting', lines=lines)

def render_text_file(path, display_type, exit_code=200):
    path = '/' + path
    directory_path = '/'.join(path.split('/')[:-1])
    page = path.split("/")[-1]
    lookup = all_pages[path]
    if display_type == 'cat':
        lines = [TerminalLine(input=f"cat {page}", output=lookup.value, num=0, path=directory_path, pretty_render=lookup.pretty_render)]
        return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=directory_path,lines=lines), exit_code
    elif display_type == 'nano':
        return render_template('nano.html', visits=get_visits(), file=path, content=lookup), exit_code
    elif display_type == 'man':
        lines = [TerminalLine(input=f"man {'.'.join(page.split('.')[:-1])}", output=lookup.value, num=0, path=directory_path,pretty_render=lookup.pretty_render)]
        return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=directory_path,lines=lines), exit_code
    else:
        display_type = random.sample(text_display_types, 1)[0]
        return render_text_file('.misc/404.txt',display_type, exit_code=404)

def render_directory(path):
    path = '/' + path
    return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=path, lines=[]), 200

def render_executable(path):
    return render_template('executable.html', js_file=f"{path.split('/')[-1]}.js")

@app.route('/<path:path>', methods=['GET'])
def get_page(path):
    if not os.path.exists(BASE_DIR + f"/static/home/{path}"):
        print(f"File {path} does not exist")
        display_type = random.sample(text_display_types, 1)[0]
        return render_text_file('.misc/404.txt', display_type, exit_code=404)
    if any([path.endswith(extension) for extension in text_extensions]):
        return render_text_file(path, request.args.get('display_type', default='cat'))
    elif any([path.endswith(extension) for extension in executable_extensions]) or os.path.isfile(BASE_DIR + f'/static/home/{path}'):
        return render_executable(path)
    else:
        return render_directory(path)


@app.route('/', methods=['GET'])
def get_home():
    output = parseFile(f"static/home/home.txt")
    lines = [TerminalLine(input="neofetch", output=output, num=0, path='/')]
    increment_counter()
    return render_template('terminal.html', visits=get_visits(), path='/', all_pages=all_pages, lines=lines), 200

# Favicon generated with https://text-to-svg.com/
if __name__ == '__main__':
    if not os.path.exists(BASE_DIR + "/visits.txt"):
        with open('visits.txt', 'w') as f:
            f.write("0")
    if os.path.exists(BASE_DIR + "/visits.lock"):
        os.remove(BASE_DIR + "/visits.lock")
    app.run(host='0.0.0.0', port=5000,debug=False)