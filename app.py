import argparse
import logging
import os
from dataclasses import dataclass
import math
import random

from flask import Flask, request, redirect, url_for, render_template, send_file
from werkzeug.utils import send_from_directory

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

@app.route("/api/download/<path:path>")
def download_file(path):
    full_path = f'{BASE_DIR}/static/home/{path}';
    return send_file(full_path, as_attachment=True)

@app.route("/api/high-score", methods=['GET'])
def update_high_score():
    try:
        game = request.args.get("game")
        score = int(request.args.get("score"))
        lock = f"{BASE_DIR}/high_scores/{game}.lock"
        file = f"{BASE_DIR}/high_scores/{game}.txt"
        while os.path.exists(lock):
            pass
        with open(lock, 'w') as f:
            f.write("lock")
        with open(file, 'r') as f:
            high_scores_str = f.read().split('\n')
        top_10 = []
        index = 0
        while len(top_10) < 10 and index < len(high_scores_str):
            if high_scores_str[index]:
                top_10.append(int(high_scores_str[index]))
            index += 1
        top_10.append(score)
        top_10.sort()
        top_10.reverse()
        with open(file, 'w') as f:
            f.write('\n'.join([ str(s) for s in top_10[:10]]))
        os.remove(lock)
        return "success", 200
    except Exception as e:
        return f"error: {e}", 404


@app.route("/crash", methods=['GET'])
def crash():
    pass

@app.route("/pages/random-stuff/hosting/hosting.txt", methods=['GET'])
def get_hosting():
    if not request.args.get("display_type") == 'cat':
        return get_page('pages/random-stuff/hosting/hosting.txt')
    text = all_pages['/pages/random-stuff/hosting/hosting.txt']
    fastfetch = all_pages['/pages/random-stuff/hosting/fastfetch.txt']
    lines = [TerminalLine(input="cat hosting.txt", output=text.value, num=0, path='/pages/random-stuff/hosting')]
    lines.append(TerminalLine(input="ssh root@ken fastfetch", output=fastfetch.value, num=1, path='/pages/random-stuff/hosting'))
    return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path='/pages/random-stuff/hosting', lines=lines)

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
    elif display_type == 'tilde':
        return render_template('tilde.html', visits=get_visits(), file=path, content=lookup), exit_code
    else:
        display_type = random.sample(text_display_types, 1)[0]
        return render_text_file('.misc/404.txt',display_type, exit_code=404)

def render_directory(path):
    path = '/' + path
    return render_template('terminal.html', visits=get_visits(), all_pages=all_pages, path=path, lines=[]), 200

def render_executable(path):
    name = path.split('/')[-1]
    if os.path.exists(f"{BASE_DIR}/high_scores/{name}.txt"):
        with open(f"{BASE_DIR}/high_scores/{name}.txt", 'r') as f:
            split = f.read().split('\n')
        high_scores = []
        for s in split:
            if s:
                high_scores.append(int(s))
    else:
        high_scores = []
    return render_template('executable.html', js_file=f"{name}.js", high_scores=high_scores)

@app.route('/<path:path>', methods=['GET'])
def get_page(path):
    if not os.path.exists(BASE_DIR + f"/static/home/{path}"):
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

# Favicon generated with https://text-to-svg.com/ and https://boxy-svg.com/
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=False)

# propagate about pages
# rewrite debian page
# swap out man for tilde