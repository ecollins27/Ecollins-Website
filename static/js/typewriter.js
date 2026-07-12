const animationLength = 1000;
var numLines = lines.length;
const form = document.getElementById("terminal_form");
var terminalNum = 0;
var terminal_input = document.getElementById("terminal_input_0");

const fileStructure = {"cats":{}, "about":{}, "projects":{"website":{}}};

function getNextHTML(commandOutput, num){
    html = "<div class=\"typewriter\">\n<span class=\"ghost\">" + commandOutput + "</span>\n<span id=\"output_" + numLines + "\" class=\"terminal_content\" data-text=\"" + commandOutput +"\"></span>\n</div>\n";
    html += "<span id=\"header_" + (num + 1) + "\" class=\"terminal_header\">ecollins@ecollins-pc<span style=\"color: #ffffff;\">:</span><span style=\"color:#0077ff;\">/" + filePath + "</span><span style=\"color:#ffffff;\">$</span></span>\n"
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
    if (commandSplit[0] == "cd"){
        var [valid, absolutePath] = parsePath(commandSplit[1]);
        if (!valid){
            commandOutput = "No such directory /" + absolutePath;
        } else {
            window.location = absolutePath;
            return;
        }
    } else {
        commandOutput = "hello there";
    }
    form.insertAdjacentHTML("beforeend", getNextHTML(commandOutput, numLines));
    terminal_input = document.getElementById("terminal_input_" + terminalNum);
    numLines++;
    nextAnimation(numLines - 1, false);
}

function onComplete(){
    for (let i = 0; i < buttons.length; i++){
        document.getElementById(buttons[i]).style.visibility = "visible";
    }
}

function calculateDelays(textLength){
    var delay = Math.floor(animationLength / textLength);
    var char_per_tick = 1;
    if (delay == 0){
        char_per_tick = Math.ceil(textLength / animationLength);
    }
    return [delay, char_per_tick];
}

function nextAnimation(num, input){
    var element;
    if (input){
        document.getElementById("header_" + num).style.visibility = "visible";
        if (num >= numLines){
            terminal_input.style.visibility = "visible";
            terminal_input.focus();
            console.log("here");
        }
        if (num > 0 && num <= lines.length){
            images = lines[num - 1].images;
            for (let i = 0; i < images.length; i++){
                element = document.getElementById("image_" + (num - 1) + "_" + i);
                element.classList.add("loaded_container");
                element.style.visibility = "visible";
            }
        }
    }
    if (num >= numLines){
        onComplete();
        return;
    }
    var element;
    if (input){
        element = document.getElementById("input_" + num);
    } else {
        element = document.getElementById("output_" + num);
    }
    var text = element.dataset.text;
    var [delay, char_per_tick] = calculateDelays(text.length);
    setTimeout(type, 100, element, text, num < lines.length? lines[num].colors:{}, delay, char_per_tick, 0, num, input)
}

function type(element, text, colors, delay, char_per_tick, index, num, input) {
    if (index < text.length) {
        var color;
        for (let i = 0; i < char_per_tick; i++){
            if (index >= text.length){
                break;
            }
            color = !input? colors[index]:null;
            if (color != null){
                element.insertAdjacentHTML("beforeend", "<span style=\"color:" + color + ";\">" + text[index++] + "</span>");
            } else {
                element.insertAdjacentHTML("beforeend", text[index++]);
            }
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
    console.log(absoluteSplit);
    console.log(fileSplit);
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

var element;
for (let i = 0; i < buttons.length; i++){
    element = document.getElementById(buttons[i]);
    element.addEventListener("click", function(event){
        var text = "cd " + getRelativePath(buttons[i]);
        console.log(text);
        var [delay, char_per_tick] = calculateDelays(text.length);
        fillTextBox(terminal_input, text, delay, char_per_tick, 0);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const command = terminal_input.value;
    executeCommand(command);
});

nextAnimation(0, true);