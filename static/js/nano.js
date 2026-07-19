import * as utils from "./utils.js"

function addButton(parentElement, content, path, color){
    var html = "<button id=\"" + content + "\" type=\"button\" style=\"color:" + color + ";\">" + content + "</button>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var buttonElement = document.getElementById(content);
    if (path.startsWith("http")){
        buttonElement.addEventListener("click", function(event){
            window.open(path, '_blank').focus();
        });
    } else {
        var absolutePath = utils.getAbsolutePath(path);
        buttonElement.addEventListener("click", function(event){
            window.location = absolutePath + "-" + displayType;
        });
    }
    return html;
}

function fillContent(element, text, colors, delay, char_per_tick, index){
    if (index < text.length) {
        var color;
        for (let i = 0; i < char_per_tick; i++){
            if (index >= text.length){
                break;
            }
            color = colors[index];
            var character = text[index];
            if (character == '{'){
                close = text.indexOf("}", index + 2);
                var data = text.substring(index + 2, close).split(",");
                var elementType = text[index + 1];
                index = close;
                if (elementType == 'b'){
                    addButton(element, data[0], data[1], data[2]);
                } else if (elementType == 'i'){
                    utils.addImage(element, data[0], data[1], data.slice(2).join(','));
                }
            } else if (color != null){
                element.insertAdjacentHTML("beforeend", "<span style=\"color:" + color + ";\">" + character + "</span>");
            } else {
                element.insertAdjacentHTML("beforeend", character);
            }
            index++;
        }
        setTimeout(fillContent, delay, element, text, colors, delay, char_per_tick, index);
    }
}

document.getElementById("exit").addEventListener("click", function(event) {
    window.location = document.referrer;
});

document.getElementById("terminal").addEventListener("click", function(event) {
    window.location = '/' + utils.filePath;
});

document.getElementById("home").addEventListener("click", function(event){
    window.location = "/";
});

document.getElementById("about").addEventListener("click", function(event) {
    window.location = "/about/about.txt-cat";
});

document.getElementById("projects").addEventListener("click", function(event) {
    window.location = "/projects/projects.txt-man";
});

document.getElementById("cats").addEventListener("click", function(event) {
    window.location = "/cats/cats.txt-nano";
});

var element = document.getElementById("nano_content")
var text = content.value;
var [delay, char_per_tick] = utils.calculateDelays(text.length);
setTimeout(fillContent, 100, element, text, content.colors, delay, char_per_tick, 0)