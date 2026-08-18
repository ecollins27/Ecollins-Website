import * as utils from "./utils.js"

export var terminal_input = document.getElementById("terminal_input_0");
export const terminal_form = document.getElementById("terminal_form");
var terminalNum = 0;
var defaultFileDisplay = "";
var text_extensions = [".txt", ".css", ".html", ".js", ".raw", ".py", ".wsgi", ".sh"];

export function setDefaultFileDisplay(dt){
    defaultFileDisplay = dt;
}

function executeCd(commandSplit){
    var commandOutput;
    var path = utils.filePath;
    var absolutePath = utils.getAbsolutePath(commandSplit[1]);
    if (!utils.isValid(absolutePath) || utils.isFile(absolutePath)){
        commandOutput = "Directory /" + absolutePath + " does not exist";
    } else {
        var fileDisplay = defaultFileDisplay;
        defaultFileDisplay = "";
        if (absolutePath == ""){
            window.location = "/";
            return [commandOutput, path, true];
        } else {
            if (fileDisplay == ""){
                window.location = '/' + absolutePath;
            } else {
                window.location = '/' + absolutePath + "/" + fileDisplay;
            }
            return [commandOutput, path, true];
        }
    }
    return [commandOutput, path, false];
}

function executeLs(commandSplit){
    var commandOutput;
    var path = utils.filePath;
    var absolutePath;
    if (commandSplit.length > 1){
        var argumentSplit = commandSplit[1].split('/');
        if (commandSplit[1].startsWith('/')){
            argumentSplit.splice(0, 1);
            absolutePath = argumentSplit.join('/');
        } else {
            absolutePath = utils.getAbsolutePath(argumentSplit.join('/'));
        }
    } else {
        absolutePath = utils.filePath;
    }
    if (!utils.isValid(absolutePath)){
        return ["Directory /" + absolutePath + " does not exist", path, false];
    }
    var fileSystem = utils.fileStructure;
    var directoryName = "";
    const fileSplit = absolutePath.split('/');
    for (let i = 0; i < fileSplit.length; i++){
        if (fileSplit[i] != ""){
            fileSystem = fileSystem[fileSplit[i]];
            directoryName = fileSplit[i];
        }
        if (fileSystem == null){
            return ["directory " + fileSplit[i] + " does not exist", path, false];
        }
    }
    commandOutput = "";
    for (const [key, value] of Object.entries(fileSystem)){
        if (!utils.isFile(absolutePath + "/" + key)){
            commandOutput += "{c#0398fc}";
        } else if (utils.isExecutable(absolutePath + "/" + key)){
            commandOutput += "{c#00ff00}";
        }
        commandOutput += key + "  ";
        if (!utils.isFile(absolutePath + "/" + key)){
            commandOutput += "{c#0398fc}";
        } else if (utils.isExecutable(absolutePath + "/" + key)){
            commandOutput += "{c#00ff00}";
        }
    }
    return [commandOutput, path, false];
}

function getNextHTML(commandOutput, num, path){
    commandOutput = commandOutput.replaceAll("\"", "&quot;");
    var html = "<div class=\"typewriter\">\n<span id=\"ghost_output_" + numLines + "\" class=\"ghost\">" + commandOutput + "</span>\n<span id=\"output_" + numLines + "\" class=\"terminal_content\" data-text=\"" + commandOutput +"\"></span>\n</div>\n";
    html += "<span id=\"header_" + (num + 1) + "\" class=\"terminal_header\">root@ehrencollins.org<span style=\"color: #ffffff;\">:</span><span style=\"color:#0077ff;\">/" + path + "</span><span style=\"color:#ffffff;\">$</span></span>\n"
    html += "<input type=\"text\" id=\"terminal_input_" + terminalNum + "\" name=\"textbox\" autocomplete=\"off\" size=100>";
    return html;
}

function executeNano(commandSplit){
    var commandOutput;
    var path = utils.filePath;
    if (commandSplit.length != 2){
        commandOutput = "command nano requires exactly 1 argument";
    } else {
        var absolutePath = utils.getAbsolutePath(commandSplit[1]);
        if (!utils.isValid(absolutePath)){
            return ["File /" + absolutePath + " does not exist", path, false];
        } else if (!utils.isFile(absolutePath)){
            return [absolutePath + " is not a file", path, false];
        }
        var text_file = false;
        for (let i = 0; i < text_extensions.length; i++){
            if (absolutePath.endsWith(text_extensions[i])){
                text_file = true;
            }
        }
        if (!text_file){
            return ["File /" + absolutePath + " is not a text file", path, false];
        }
        var directory = absolutePath.split('/').pop();
        window.location = "/" + absolutePath + "?display_type=nano";
        return [commandOutput, path, true];
    }
    return [commandOutput, path, false];
}

function executeTilde(commandSplit){
    var commandOutput;
    var path = utils.filePath;
    if (commandSplit.length != 2){
        commandOutput = "command tilde requires exactly 1 argument";
    } else {
        var absolutePath = utils.getAbsolutePath(commandSplit[1]);
        if (!utils.isValid(absolutePath)){
            return ["File /" + absolutePath + " does not exist", path, false];
        } else if (!utils.isFile(absolutePath)){
            return [absolutePath + " is not a file", path, false];
        }
        var text_file = false;
        for (let i = 0; i < text_extensions.length; i++){
            if (absolutePath.endsWith(text_extensions[i])){
                text_file = true;
            }
        }
        if (!text_file){
            return ["File /" + absolutePath + " is not a text file", path, false];
        }
        var directory = absolutePath.split('/').pop();
        window.location = "/" + absolutePath + "?display_type=tilde";
        return [commandOutput, path, true];
    }
    return [commandOutput, path, false];
}

function executeCat(commandSplit){
    var path = utils.filePath;
    if (commandSplit.length > 2){
        return ["command cat requires exactly 1 argument", path, false];
    }
    var absolutePath = utils.getAbsolutePath(commandSplit[1]);
    if (!utils.isValid(absolutePath)) {
        return ["File /" + absolutePath + " does not exist", path, false];
    }
    var text_file = false;
    for (let i = 0; i < text_extensions.length; i++){
        if (absolutePath.endsWith(text_extensions[i])){
            text_file = true;
        }
    }
    if (!text_file){
        return ["File /" + absolutePath + " is not a text file", path, false];
    }
    const text = all_pages["/" + absolutePath].pretty_render + "-" + all_pages["/" + absolutePath].value
    const div = document.createElement("div");
    div.textContent = text;
    return [div.innerHTML, path, false];
}

export function executeCommand(command){
    var commandSplit = command.split(" ");
    terminal_input.readOnly = true;
    terminal_input.disabled = true;
    terminalNum++;
    var commandOutput;
    var path = utils.filePath;
    var end;
    if (commandSplit[0] == "sudo"){
        commandSplit = commandSplit.slice(1);
    }
    if (commandSplit.length == 0) {
        commandOutput = "";
    } else if (commandSplit[0] == "cd"){
        [commandOutput, path, end] = executeCd(commandSplit);
        if (end){
            return null;
        }
    } else if (commandSplit[0] == 'ls'){
        [commandOutput, path, end] = executeLs(commandSplit);
        if (end){
            return null;
        }
    } else if (commandSplit[0] == "neofetch") {
        commandOutput = all_pages["/home.txt"].value;
    } else if (commandSplit[0] == "home"){
        [commandOutput, path, end] = executeCd(["cd","/"]);
        if (end){
            return null;
        }
    } else if (commandSplit[0] == "visitors") {
        commandOutput = "{c#ffff00}" + visits + "{c#ffff00} people have visited this website!";
    } else if (commandSplit[0] == "help") {
        commandOutput = "This website simulates a Linux kernel.  Basic commands such as cd, ls, cat, nano, and neofetch are all the valid commands and operate as intended.\n\nThe following custom commands are also included:\n\n{c#ffff00}home{c#ffff00} - returns to the home page\n{c#ffff00}visitors{c#ffff00} - displays the number of visits to the site's homepage\n{c#ffff00}download{c#ffff00} - downloads the specified file\n\nNaturally, the kernel contains a number of easter eggs.  How many can you find?";
    } else if (commandSplit[0] == "download"){
        var absolutePath = utils.getAbsolutePath(commandSplit[1]);
        if (!utils.isValid(absolutePath)){
            commandOutput = "File " + absolutePath + " does not exist";
        } else if (!utils.isFile(absolutePath)){
            commandOutput = absolutePath + " is not a file";
        } else {
            window.open("/api/download/" + absolutePath, '_blank').focus();
            commandOutput = "File " + absolutePath + " successfully downloaded";
        }
    } else if (commandSplit[0] == "cat"){
        [commandOutput, path, end] = executeCat(commandSplit);
        if (end){
            return null;
        }
    } else if (commandSplit[0] == 'nano'){
        [commandOutput, path, end] = executeNano(commandSplit);
        if (end){
            return null;
        }
    } else if (commandSplit[0] == 'tilde'){
        [commandOutput, path, end] = executeTilde(commandSplit);
        if (end){
            return null;
        }
    } else if (commandSplit[0] == "vim" || commandSplit[0] == "vi"){
        window.location = "/.misc/no.txt?display_type=nano";
        return;
    } else if (commandSplit[0] == "shutdown"){
        window.location = "/crash";
        return;
    } else if (commandSplit[0] == "rm"){
        var r = false, f = false;
        var rootDir = false;
        for (let i = 1; i < commandSplit.length; i++){
            if (commandSplit[i].startsWith("-")){
                r = r || commandSplit[i].includes("r");
                f = f || commandSplit[i].includes("f");
            } else if (commandSplit[i].endsWith("*") && utils.getAbsolutePath(commandSplit[i].substring(0, commandSplit[i].length - 1)) == ""){
                rootDir = true;
            } else if (utils.getAbsolutePath(commandSplit[i]) == ""){
                rootDir = true;
            }
        }
        if (r && f && rootDir){
            commandOutput = "{v640,480,/.misc/Rick-Astley-Never-Gonna-Give-You.mp4}\nNice try ;)";
        } else {
            commandOutput = "Unable to delete write-protected files";
        }
    } else {
        var absolutePath = utils.getAbsolutePath(command);
        if (utils.isValid(absolutePath) && utils.isFile(absolutePath)){
            if (!utils.isExecutable(absolutePath)){
                commandOutput = "File /" + absolutePath + " is not executable";
            } else {
                window.location = "/" + absolutePath;
                return;
            }
        } else {
            commandOutput = commandSplit[0] + ": command not found";
        }
    }
    terminalNum++;
    terminal_form.insertAdjacentHTML("beforeend", getNextHTML(commandOutput, numLines, path));
    terminal_input = document.getElementById("terminal_input_" + terminalNum);
    numLines++;
    return true;
}