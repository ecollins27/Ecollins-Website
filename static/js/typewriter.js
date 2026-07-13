const animationLength = 1000;
const filePath = window.location.pathname.substring(1);
var numLines = lines.length;
const form = document.getElementById("terminal_form");
var terminalNum = 0;
var terminal_input = document.getElementById("terminal_input_0");

const fileStructure = {"cats":{}, "about":{}, "projects":{"website":{}}};
function addButton(parentElement, content, path, color){
    html = "<button id=\"" + content + "\" type=\"button\" style=\"color:" + color + ";\">" + content + "</button>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var buttonElement = document.getElementById(content);
    if (path.startsWith("http")){
        buttonElement.addEventListener("click", function(event){
            window.open(path, '_blank').focus();
        });
    } else {
        buttonElement.addEventListener("click", function(event){
            var text = "cd " + getRelativePath(path);
            var [delay, char_per_tick] = calculateDelays(text.length);
            fillTextBox(terminal_input, text, delay, char_per_tick, 0);
        });
    }
}

function addImage(parentElement, src, height){
    html = "<div class=\"image_wrapper\">\n<img class=\"ghost\" src=\"" + src + "\" height=" + height + "px>\n<span id=\"" + src + "\" class=\"img_container\">\n<img src=\"" + src + "\" height=300px>\n</span>\n</div>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var imageElement = document.getElementById(src);
    imageElement.classList.add("loaded_container");
    imageElement.style.visibility = "visible";
}

function getNextHTML(commandOutput, num){
    commandOutput = commandOutput.replaceAll("\"", "&quot;");
    html = "<div class=\"typewriter\">\n<span class=\"ghost\">" + commandOutput + "</span>\n<span id=\"output_" + numLines + "\" class=\"terminal_content\" data-text=\"" + commandOutput +"\"></span>\n</div>\n";
    html += "<span id=\"header_" + (num + 1) + "\" class=\"terminal_header\">root@ehrencollins.org<span style=\"color: #ffffff;\">:</span><span style=\"color:#0077ff;\">/" + filePath + "</span><span style=\"color:#ffffff;\">$</span></span>\n"
    html += "<input type=\"text\" id=\"terminal_input_" + terminalNum + "\" name=\"textbox\" autocomplete=\"off\">";
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

function executeCommand(command){
    var commandSplit = command.split(" ");
    terminal_input.readOnly = true;
    terminal_input.disabled = true;
    terminalNum++;
    var commandOutput;
    var colors = {};
    if (commandSplit[0] == "cd"){
        var [valid, absolutePath] = parsePath(commandSplit[1]);
        if (!valid){
            commandOutput = "No such directory /" + absolutePath;
        } else {
            window.location = absolutePath;
            return;
        }
    } else if (commandSplit[0] == 'ls'){
        var regex = new RegExp(commandSplit.length > 1? commandSplit[1].replace("*",".*"):".*");
        const fileSplit = filePath.split("/");
        fileSystem = fileStructure;
        for (let i = 0; i < fileSplit.length; i++){
            if (fileSplit[i] != ""){
                fileSystem = fileSystem[fileSplit[i]];
            }
        }
        commandOutput = "";
        if (fileSystem != null){
            for (const [key, value] of Object.entries(fileSystem)){
                if (regex.test(key)){
                    for (let i = commandOutput.length; i < commandOutput.length + key.length; i++){
                        colors[i] = "#0398fc";
                    }
                    commandOutput += key + "  ";
                }
            }
            if (filePath != ""){
                commandOutput += fileSplit.pop() + ".txt";
            }
        }
    } else if (commandSplit[0] == "neofetch") {
        commandOutput = neofetch["output"];
        colors = neofetch["colors"];
    } else if (commandSplit[0] == "cat"){
        if (commandSplit[1] == filePath.split("/").pop() + ".txt"){
            commandOutput = document.getElementById("output_0").dataset.text;
            colors = lines[0].colors;
        }
    } else if (commandSplit[0] == "vim" || commandSplit[1] == "vi"){
        window.location = "/no";
        return;
    } else {
        commandOutput = command + ": command not found";
    }
    form.insertAdjacentHTML("beforeend", getNextHTML(commandOutput, numLines));
    terminal_input = document.getElementById("terminal_input_" + terminalNum);
    numLines++;
    nextAnimation(numLines - 1, false, colors);
}

function onComplete(){
}

function calculateDelays(textLength){
    var delay = Math.floor(animationLength / textLength);
    var char_per_tick = 1;
    if (delay == 0){
        char_per_tick = Math.ceil(textLength / animationLength);
    }
    return [delay, char_per_tick];
}

function nextAnimation(num, input, colors=null){
    var element;
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
    } else {
        element = document.getElementById("output_" + num);
    }
    var text = element.dataset.text;
    var [delay, char_per_tick] = calculateDelays(text.length);
    setTimeout(type, 100, element, text, num < lines.length? lines[num].colors:colors, delay, char_per_tick, 0, num, input)
}

function type(element, text, colors, delay, char_per_tick, index, num, input) {
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
                    addButton(element, data[0], data[1], data[2]);
                } else if (elementType == 'i'){
                    addImage(element, data[0],data[1]);
                }
            } else if (color != null){
                element.insertAdjacentHTML("beforeend", "<span style=\"color:" + color + ";\">" + character + "</span>");
            } else {
                element.insertAdjacentHTML("beforeend", character);
            }
            index++;
        }
        setTimeout(type, delay, element, text, colors, delay, char_per_tick, index, num, input);
    } else {
        if (input){
            nextAnimation(num, !input);
        } else {
            nextAnimation(num + 1, !input);
        }
    }
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

function getAbsolutePath(path, fileSystem){
    if (path == "home"){
        return "";
    }
    if (fileSystem[path] != null){
        return path;
    }
    var p;
    for (const [key, value] of Object.entries(fileSystem)) {
        p = getAbsolutePath(path, value);
        if (p != null){
            return key + "/" + p;
        }
    }
    return null;
}

function getRelativePath(path){
    var absolutePath = getAbsolutePath(path, fileStructure);
    const absoluteSplit = absolutePath.split("/");
    const fileSplit = filePath.split("/");
    var relative = "";
    var index = fileSplit.length - 1;
    while (index >= 0 && (index >= absoluteSplit.length || (absoluteSplit[index] != fileSplit[index]))){
        relative += "/..";
        index--;
    }
    for (let i = index + 1; i < absoluteSplit.length; i++){
        relative += "/" + absoluteSplit[i];
    }
    return relative.substring(1);
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const command = terminal_input.value;
    executeCommand(command);
});

nextAnimation(0, true);