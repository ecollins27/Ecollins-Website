const animationLength = 1000;
const filePath = window.location.pathname.substring(1);
const pageDisplayType = {"cats": "nano", "edgar-alice":"cat", "about":"cat", "projects": "man", "website": "man"};
const fileStructure = {"cats":{"edgar-alice":{}}, "about":{}, "projects":{"website":{}}};

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

function goTo(page){
    if (page == "home" || page == ""){
        window.location = "/";
    } else {
        window.location = "/" + getAbsolutePath(page, fileStructure) + "-" + pageDisplayType[page];
    }
}

function addImage(parentElement, src, height){
    html = "<span class=\"image_wrapper\">\n<img class=\"ghost\" src=\"" + src + "\" height=" + height + "px>\n<div id=\"" + src + "\" class=\"img_container\">\n<img src=\"" + src + "\" height=" + height + "px>\n</div>\n</span>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var imageElement = document.getElementById(src);
    var styleSheet = window.document.styleSheets[0];
    var imageName = src.split("/").pop().split(".")[0];
    styleSheet.insertRule("@keyframes image-load-" + imageName +" {\nfrom { height: 0px; }\nto { height: " + height + "px; }\n}");
    imageElement.style.overflow = "hidden";
    imageElement.style.animation = "image-load-" + imageName + " 2s steps(50, end) forwards";
    imageElement.style.visibility = "visible";
    return "<img src=\"" + src + "\" height=" + height + "px>";
}

function addButton(terminal_input, terminal_form, parentElement, content, path, color){
    html = "<button id=\"" + content + "\" type=\"button\" style=\"color:" + color + ";\">" + content + "</button>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var buttonElement = document.getElementById(content);
    if (path.startsWith("http")){
        buttonElement.addEventListener("click", function(event){
            window.open(path, '_blank').focus();
        });
    } else {
        var currentDisplayType = filePath.split('/').pop().split('-').pop();
        console.log(currentDisplayType);
        var displayType = pageDisplayType[path];
        console.log(currentDisplayType);
        buttonElement.addEventListener("click", function(event){
            if (currentDisplayType == 'nano'){
                window.location = getAbsolutePath(path, fileStructure) + "-" + displayType;
            } else {
                var text;
                if (displayType == 'cat' || displayType == 'man' || path == "home") {
                    var text = "cd " + getRelativePath(path);
                } else {
                    var text = "nano " + getRelativePath(path) + '/' + path + ".txt";
                }
                var [delay, char_per_tick] = calculateDelays(text.length);
                fillTextBox(terminal_input, terminal_form, text, delay, char_per_tick, 0);
            }
        });
    }
    return html;
}

function fillTextBox(element, form, text, delay, char_per_tick, index){
    for (let i = 0; i < char_per_tick; i++){
        if (index >= text.length){
            form.requestSubmit();
            return;
        }
        element.value += text[index++];
        element.dispatchEvent(new Event("input", {bubbles: true}));
    }
    setTimeout(fillTextBox, delay, element, form, text, delay, char_per_tick, index);
}

function calculateDelays(textLength){
    var delay = Math.floor(animationLength / textLength);
    var char_per_tick = 1;
    if (delay == 0){
        char_per_tick = Math.ceil(textLength / animationLength);
    }
    return [delay, char_per_tick];
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