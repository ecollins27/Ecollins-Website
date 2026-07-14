function executeCd(commandSplit){
    var commandOutput;
    var path = filePath;
    var [valid, absolutePath] = parsePath(commandSplit[1]);
    if (!valid){
        commandOutput = "No such directory /" + absolutePath;
    } else {
        var displayType = pageDisplayType[absolutePath.split('/').pop()];
        console.log(absolutePath);
        if (absolutePath == "/"){
            window.location = "/";
            return [commandOutput, path, true];
        } else {
            window.location = absolutePath + "-" + displayType;
            return [commandOutput, path, true];
        }
    }
    return [commandOutput, path, false];
}

function executeLs(commandSplit){
    var commandOutput;
    var path = filePath;
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
    return [commandOutput, path, false];
}

function executeNano(commandSplit){
    var commandOutput;
    var path;
    if (commandSplit.length != 2){
        commandOutput = "command nano requires exactly 1 argument";
    } else {
        var argument = commandSplit[1];
        var pathStack;
        if (argument.startsWith('/')) {
            pathStack = argument.split('/');
        } else {
            pathStack = filePath.split('/');
            console.log(pathStack);
            var argumentSplit = argument.split('/');
            console.log(argumentSplit);
            for (let i = 0; i < argumentSplit.length; i++){
                if (argumentSplit[i] == "" || argumentSplit[i] == '.'){
                    continue;
                } else if (argumentSplit[i] == '..'){
                    pathStack.pop();
                } else {
                    pathStack.push(argumentSplit[i]);
                }
                console.log(pathStack);
            }
        }
        console.log(pathStack);
        if (!pathStack.pop().endsWith(".txt")){
            commandOutput = "argument must be a file";
        } else {
            window.location = pathStack.join('/') + "-nano";
            return [commandOutput, path, true];
        }
    }
    return [commandOutput, path, false];
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
        [commandOutput, path, end] = executeLs(commandSplit);
        if (end){
            return;
        }
    } else if (commandSplit[0] == "neofetch") {
        commandOutput = neofetch["output"];
        colors = neofetch["colors"];
    } else if (commandSplit[0] == "cat"){
        if (commandSplit[1] == filePath.split("/").pop() + ".txt"){
            commandOutput = document.getElementById("output_0").dataset.text;
            colors = lines[0].colors;
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
    form.insertAdjacentHTML("beforeend", getNextHTML(commandOutput, numLines, path));
    terminal_input = document.getElementById("terminal_input_" + terminalNum);
    numLines++;
    nextAnimation(numLines - 1, false, colors);
}