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
            window.location = "/" + absolutePath;
        });
    }
    return html;
}

function fillContent(element, text, current_color, delay, char_per_tick, index, pretty){
    if (index < text.length) {
        var color = current_color;
        for (let i = 0; i < char_per_tick; i++){
            if (index >= text.length){
                break;
            }
            var character = text[index];
            if (character == '{' && pretty){
                close = text.indexOf("}", index + 2);
                var data = text.substring(index + 2, close).split(",");
                var elementType = text[index + 1];
                index = close;
                if (elementType == 'b'){
                    addButton(element, data[0], data[1], data[2]);
                } else if (elementType == 'i'){
                    utils.addImage(element, data[0], data[1], data.slice(2).join(','));
                } else if (elementType == 'c'){
                    if (data[0] == current_color){
                        color = null;
                    } else {
                        color = data[0];
                    }
                }
            } else if (color != null){
                element.insertAdjacentHTML("beforeend", "<span style=\"color:" + color + ";\">" + character + "</span>");
            } else {
                element.insertAdjacentHTML("beforeend", character);
            }
            index++;
        }
        setTimeout(fillContent, delay, element, text, color, delay, char_per_tick, index, pretty);
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
    window.location = "/pages/about/about.txt?display_type=cat";
});

document.getElementById("projects").addEventListener("click", function(event) {
    window.location = "/pages/projects/projects.txt?display_type=man";
});

document.getElementById("cats").addEventListener("click", function(event) {
    window.location = "/pages/cats/cats.txt?display_type=nano";
});

var element = document.getElementById("nano_content")
var text = content.value;
var [delay, char_per_tick] = utils.calculateDelays(text.length);
setTimeout(fillContent, 100, element, text, null, delay, char_per_tick, 0, content.pretty_render)