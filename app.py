import argparse
import logging
import os
from dataclasses import dataclass
import math

from flask import Flask, request, redirect, url_for, render_template
app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@dataclass
class Line:
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

neofetch_str, neofetch_colors = parseFile("static/texts/home.txt")
neofetch_object = {"output": neofetch_str, "colors": neofetch_colors}

@app.route('/<path:path>', methods=['GET'])
def get_page(path):
    path = "/" + path
    page = path.split("/")[-1]
    if not os.path.exists(BASE_DIR + f"/static/texts/{page}.txt"):
        page = '404'
    output, colors = parseFile(f"static/texts/{page}.txt")
    lines = [Line(input=f"cat {page}.txt", output=output, colors=colors, num=0, path=path)]
    return render_template('index.html', neofetch=neofetch_object, lines=lines)

@app.route('/', methods=['GET'])
def get_home():
    output, colors = parseFile(f"static/texts/home.txt")
    lines = [Line(input="neofetch", output=output, colors=colors, num=0, path='/')]
    return render_template('index.html', neofetch=neofetch_object, lines=lines)


if __name__ == '__main__':
    # from waitress import serve
    # serve(app,host='0.0.0.0',port=8080)
    # gunicorn -w 4 'web_printer:app' -b '0.0.0.0:8080'
    app.run(host='0.0.0.0', port=5000,debug=False)