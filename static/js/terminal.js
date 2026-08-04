import * as utils from "./utils.js"
import * as commands from "./commands.js"

function addButton(parentElement, content, path, color){
    var html = "<button id=\"" + content + "\" type=\"button\" style=\"color:" + color + ";\">" + content + "</button>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var buttonElement = document.getElementById(content);
    if (path.startsWith("http")){
        buttonElement.addEventListener("click", function(event){
            window.open(path, '_blank').focus();
        });
    } else {
        var displayType = "";
        var directoryPath = path;
        if (path != "" && path != "/"){
            displayType = path.split("/").pop().split("-").pop();
            path = path.split("-").slice(0,-1).join("-");
            directoryPath = path.split("/").slice(0, -1).join("/");
        }
        buttonElement.addEventListener("click", function(event){
            var text;
            if (displayType == 'cat' || displayType == 'man' || path == "home" || displayType == "") {
                text = "cd " + utils.getRelativePath(directoryPath);
            } else {
                text = "nano " + utils.getRelativePath(path);
            }
            var [delay, char_per_tick] = utils.calculateDelays(text.length);
            commands.setDefaultDisplayType(displayType);
            fillTextBox(commands.terminal_input, text, delay, char_per_tick, 0);
        });
    }
    return html;
}

function fillTextBox(element, text, delay, char_per_tick, index){
    for (let i = 0; i < char_per_tick; i++){
        if (index >= text.length){
            commands.terminal_form.requestSubmit();
            return;
        }
        element.value += text[index++];
        element.dispatchEvent(new Event("input", {bubbles: true}));
    }
    setTimeout(fillTextBox, delay, element, text, delay, char_per_tick, index);
}

function parsePath(path){
    var valid = true;
    if (path[0] == "/"){
        path = path.substring(1)
    } else {
        path = "/" + filePath + "/" + path;
    }
    var pathSplit = path.split("/")
    var stack = [];
    for (let i = 0; i < pathSplit.length; i++){
        if (pathSplit[i] == "." || pathSplit[i] == ""){
            continue;
        } else if (pathSplit[i] == ".."){
            if (stack.length > 0){
                stack.pop();
            }
        } else {
            stack.push(pathSplit[i]);
        }
    }
    var absolutePath = ""
    var fileSystem = fileStructure;
    for (let i = 0; i < stack.length; i++){
        fileSystem = fileSystem[stack[i]];
        absolutePath += "/" + stack[i];
        if (fileSystem == null){
            valid = false;
            break;
        }
    }
    return [valid, absolutePath.length == 0? "/":absolutePath];
}

function onComplete(){
}

function nextAnimation(num, input){
    var element;
    var ghost;
    if (input){
        document.getElementById("header_" + num).style.visibility = "visible";
        if (num >= numLines){
            commands.terminal_input.style.visibility = "visible";
            commands.terminal_input.focus();
        }
    }
    if (num >= numLines){
        onComplete();
        return;
    }
    if (input){
        element = document.getElementById("input_" + num);
        ghost = null;
    } else {
        element = document.getElementById("output_" + num);
        ghost = document.getElementById("ghost_output_" + num);
    }
    var text = element.dataset.text;
    var pretty = true;
    if (!input){
        if (text.startsWith("True") || text.startsWith("true")){
            pretty = true;
            text = text.substring(5);
        } else if (text.startsWith("False") || text.startsWith("false")) {
            pretty = false;
            text = text.substring(6);
        }
    }
    var [delay, char_per_tick] = utils.calculateDelays(text.length);
    setTimeout(type, 100, element, ghost, text, null, delay, char_per_tick, 0, num, input, pretty);
}

function type(element, ghost, text, current_color, delay, char_per_tick, index, num, input, pretty) {
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
                    var html = addButton(element, data[0], data[1], data[2]);
                    if (ghost != null){
                        ghost.innerHTML = ghost.innerHTML.replace('{b' + data.join(',') + "}", html);
                    }
                } else if (elementType == 'i'){
                    var html = utils.addImage(element, data[0], data[1], data.slice(2).join(','));
                    if (ghost != null){
                        ghost.innerHTML = ghost.innerHTML.replace('{i' + data.join(',') + "}", html);
                    }
                } else if (elementType == 'v'){
                    var html = utils.addVideo(element, data[0], data[1], data[2]);
                    if (ghost != null){
                        ghost.innerHTML = ghost.innerHTML.replace('{v' + data.join(',') + "}", html);
                    }
                } else if (elementType == 'c'){
                    if (ghost != null){
                        ghost.innerHTML = ghost.innerHTML.replace('c' + data.join(',' + "}", ""));
                    }
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
        setTimeout(type, delay, element, ghost, text, color, delay, char_per_tick, index, num, input, pretty);
    } else {
        if (input){
            nextAnimation(num, !input);
        } else {
            nextAnimation(num + 1, !input);
        }
    }
}

commands.terminal_form.addEventListener("submit", function(event) {
    event.preventDefault();

    const command = commands.terminal_input.value;
    var animate = commands.executeCommand(command);
    if (animate){
        nextAnimation(numLines - 1, false);
    }
});

nextAnimation(0, true);