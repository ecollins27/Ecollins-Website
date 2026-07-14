var terminal_input = document.getElementById("terminal_input_0");
const terminal_form = document.getElementById("terminal_form");
var terminalNum = 0;

function executeCd(commandSplit){
    var commandOutput;
    var path = filePath;
    var absolutePath = getAbsolutePathFromRelative(commandSplit[1]);
    if (!isValid(absolutePath)){
        commandOutput = "No such directory /" + absolutePath;
    } else {
        var displayType = pageDisplayType[absolutePath.split('/').pop()];
        if (absolutePath == ""){
            window.location = "/";
            return [commandOutput, path, true];
        } else {
            window.location = '/' + absolutePath + "-" + displayType;
            return [commandOutput, path, true];
        }
    }
    return [commandOutput, path, false];
}

function executeLs(commandSplit){
    var commandOutput;
    var path = filePath;
    var absolutePath;
    if (commandSplit.length > 1){
        var argumentSplit = commandSplit[1].split('/');
        if (commandSplit[1].startsWith('/')){
            argumentSplit.splice(0, 1);
            absolutePath = argumentSplit.join('/');
        } else {
            absolutePath = getAbsolutePathFromRelative(argumentSplit.join('/'));
        }
    } else {
        absolutePath = filePath;
    }
    if (!isValid(absolutePath)){
        return ["" + absolutePath + " does not exist", path, false];
    }
    fileSystem = fileStructure;
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
    console.log("Absolute: " + absolutePath);
    commandOutput = "";
    colors = {};
    for (const [key, value] of Object.entries(fileSystem)){
        for (let i = commandOutput.length; i < commandOutput.length + key.length; i++){
            colors[i] = "#0398fc";
        }
        commandOutput += key + "  ";
    }
    if (directoryName != "" && pageDisplayType[directoryName] != "man"){
        commandOutput += directoryName + ".txt";
    }
    return [commandOutput, colors, path, false];
}

function executeNano(commandSplit){
    var commandOutput;
    var path;
    if (commandSplit.length != 2){
        commandOutput = "command nano requires exactly 1 argument";
    } else {
        var argument = commandSplit[1];
        var argumentSplit = argument.split('/');
        var file = argumentSplit.pop();
        var absolutePath = getAbsolutePathFromRelative(argumentSplit.join('/'))
        if (!isValid(absolutePath)){
            return ["Directory " + absolutePath + " does not exist", path, false];
        }
        var directory = absolutePath.split('/').pop();
        console.log("Directory: /" + directory);
        if (file != directory + ".txt" || (pageDisplayType[directory] != 'nano' && pageDisplayType[directory] != 'cat')){
            return ["File /" + absolutePath + (absolutePath == ""? "":"/") + file + " does not exist", path, false];
        }
        window.location = "/" + absolutePath + "-nano";
        return [commandOutput, path, true];
    }
    return [commandOutput, path, false];
}

function executeCat(commandSplit){
    var path = filePath;
    if (commandSplit.length > 2){
        return ["command cat requires exactly 1 argument", path, false];
    }
    var argumentSplit = commandSplit[1].split('/');
    var file = argumentSplit.pop();
    var absolutePath = getAbsolutePathFromRelative(argumentSplit.join('/'));
    if (!isValid(absolutePath)) {
        return ["Directory /" + absolutePath + " does not exist", path, false]
    }
    var directory = argumentSplit.pop();
    if (file != directory + ".txt" || (pageDisplayType[directory] != "nano" && pageDisplayType[directory] != "cat")){
        return ["File /" + absolutePath + (absolutePath == ""? "":"/") + file + " does not exist", path, false];
    }
    return [all_pages[directory].value, all_pages[directory].colors, path, false]
}

function executeCommand(command){
    var commandSplit = command.split(" ");
    terminal_input.readOnly = true;
    terminal_input.disabled = true;
    terminalNum++;
    var commandOutput;
    var colors = {};
    var path = filePath;
    var end;
    if (commandSplit[0] == "cd"){
        [commandOutput, path, end] = executeCd(commandSplit);
        if (end){
            return;
        }
    } else if (commandSplit[0] == 'ls'){
        [commandOutput, colors, path, end] = executeLs(commandSplit);
        if (end){
            return;
        }
    } else if (commandSplit[0] == "neofetch") {
        commandOutput = neofetch["output"];
        colors = neofetch["colors"];
    } else if (commandSplit[0] == "cat"){
        [commandOutput, colors, path, end] = executeCat(commandSplit);
        if (end){
            return;
        }
    } else if (commandSplit[0] == 'nano'){
        [commandOutput, path, end] = executeNano(commandSplit);
        if (end){
            return;
        }
    } else if (commandSplit[0] == "vim" || commandSplit[0] == "vi"){
        window.location = "/no-nano";
        return;
    } else if (commandSplit[0] == "shutdown"){
        close();
        return;
    } else {
        commandOutput = commandSplit[0] + ": command not found";
    }
    console.log(path);
    terminalNum++;
    terminal_form.insertAdjacentHTML("beforeend", getNextHTML(commandOutput, numLines, path));
    terminal_input = document.getElementById("terminal_input_" + terminalNum);
    numLines++;
    nextAnimation(numLines - 1, false, colors);
}