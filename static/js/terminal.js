var numLines = lines.length;

function addButton(parentElement, content, path, color){
    html = "<button id=\"" + content + "\" type=\"button\" style=\"color:" + color + ";\">" + content + "</button>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var buttonElement = document.getElementById(content);
    if (path.startsWith("http")){
        buttonElement.addEventListener("click", function(event){
            window.open(path, '_blank').focus();
        });
    } else {
        var displayType = pageDisplayType[path];
        buttonElement.addEventListener("click", function(event){
            var text;
            if (displayType == 'cat' || displayType == 'man' || path == "home") {
                text = "cd " + getRelativePath(path);
            } else {
                text = "nano " + getRelativePath(path) + '/' + path + ".txt";
            }
            var [delay, char_per_tick] = calculateDelays(text.length);
            fillTextBox(terminal_input, text, delay, char_per_tick, 0);
        });
    }
    return html;
}

function fillTextBox(element, text, delay, char_per_tick, index){
    for (let i = 0; i < char_per_tick; i++){
        if (index >= text.length){
            terminal_form.requestSubmit();
            return;
        }
        element.value += text[index++];
        element.dispatchEvent(new Event("input", {bubbles: true}));
    }
    setTimeout(fillTextBox, delay, element, text, delay, char_per_tick, index);
}

function getNextHTML(commandOutput, num, path){
    commandOutput = commandOutput.replaceAll("\"", "&quot;");
    html = "<div class=\"typewriter\">\n<span id=\"ghost_output_" + numLines + "\" class=\"ghost\">" + commandOutput + "</span>\n<span id=\"output_" + numLines + "\" class=\"terminal_content\" data-text=\"" + commandOutput +"\"></span>\n</div>\n";
    html += "<span id=\"header_" + (num + 1) + "\" class=\"terminal_header\">root@ehrencollins.org<span style=\"color: #ffffff;\">:</span><span style=\"color:#0077ff;\">/" + path + "</span><span style=\"color:#ffffff;\">$</span></span>\n"
    html += "<input type=\"text\" id=\"terminal_input_" + terminalNum + "\" name=\"textbox\" autocomplete=\"off\" size=100>";
    return html;
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

function nextAnimation(num, input, colors=null){
    var element;
    var ghost;
    if (input){
        document.getElementById("header_" + num).style.visibility = "visible";
        if (num >= numLines){
            terminal_input.style.visibility = "visible";
            terminal_input.focus();
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
    var [delay, char_per_tick] = calculateDelays(text.length);
    setTimeout(type, 100, element, ghost, text, num < lines.length? lines[num].colors:colors, delay, char_per_tick, 0, num, input)
}

function type(element, ghost, text, colors, delay, char_per_tick, index, num, input) {
    if (index < text.length) {
        var color;
        for (let i = 0; i < char_per_tick; i++){
            if (index >= text.length){
                break;
            }
            color = !input? colors[index]:null;
            character = text[index];
            if (character == '{'){
                close = text.indexOf("}", index + 2);
                data = text.substring(index + 2, close).split(",");
                elementType = text[index + 1];
                index = close;
                if (elementType == 'b'){
                    var html = addButton(element, data[0], data[1], data[2]);
                    if (ghost != null){
                        ghost.innerHTML = ghost.innerHTML.replace('{b' + data.join(',') + "}", html);
                    }
                } else if (elementType == 'i'){
                    var html = addImage(element, data[0], data[1], data.slice(2).join(','));
                    if (ghost != null){
                        ghost.innerHTML = ghost.innerHTML.replace('{i' + data.join(',') + "}", html);
                    }
                }
            } else if (color != null){
                element.insertAdjacentHTML("beforeend", "<span style=\"color:" + color + ";\">" + character + "</span>");
            } else {
                element.insertAdjacentHTML("beforeend", character);
            }
            index++;
        }
        setTimeout(type, delay, element, ghost, text, colors, delay, char_per_tick, index, num, input);
    } else {
        if (input){
            nextAnimation(num, !input);
        } else {
            nextAnimation(num + 1, !input);
        }
    }
}

terminal_form.addEventListener("submit", function(event) {
    event.preventDefault();

    const command = terminal_input.value;
    executeCommand(command);
});

nextAnimation(0, true);