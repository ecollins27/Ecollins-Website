const animationLength = 1000;
var filePath = window.location.pathname.substring(1);
if (filePath.endsWith("-cat") || filePath.endsWith("-man")){
    filePath = filePath.substring(0, filePath.length - 4);
} else if (filePath.endsWith("-nano")){
    filePath = filePath.substring(0, filePath.length - 5);
}
const pageDisplayType = {"cats": "nano", "edgar-alice":"nano", "henry-lola":"nano", "about":"cat", "projects": "man", "crender":"man", "website": "man", "cformer":"man", "lemmings":"man", "aljbra":"man", "hosting":"cat", "debian":"nano"};
const fileStructure = {"debian":{}, "hosting":{}, "cats":{"edgar-alice":{}, "henry-lola":{}}, "about":{}, "projects":{"crender":{}, "website":{}, "cformer":{}, "lemmings":{}, "aljbra":{}}};

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

function goTo(page){
    if (page == "home" || page == ""){
        window.location = "/";
    } else {
        window.location = "/" + getAbsolutePathFromPage(page, fileStructure) + "-" + pageDisplayType[page];
    }
}

function addImage(parentElement, src, height, caption){
    html = "<span class=\"image_wrapper\">\n<img class=\"ghost\" src=\"" + src + "\" height=" + height + "px>\n<div id=\"" + src + "\" class=\"img_container\">\n<img src=\"" + src + "\" height=" + height + "px>\n</div>\n<span class=\"image_caption\">" + caption + "</span></span>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var imageElement = document.getElementById(src);
    var styleSheet = window.document.styleSheets[0];
    var imageName = src.split("/").pop().split(".")[0];
    styleSheet.insertRule("@keyframes image-load-" + imageName +" {\nfrom { height: 0px; }\nto { height: " + height + "px; }\n}");
    imageElement.style.overflow = "hidden";
    imageElement.style.animation = "image-load-" + imageName + " 2s steps(50, end) forwards";
    imageElement.style.visibility = "visible";
    return html;
}

function calculateDelays(textLength){
    var delay = Math.floor(animationLength / textLength);
    var char_per_tick = 1;
    if (delay == 0){
        char_per_tick = Math.ceil(textLength / animationLength);
    }
    return [delay, char_per_tick];
}

function getAbsolutePathFromPage(path, fileSystem){
    if (path == "home"){
        return "";
    }
    if (fileSystem[path] != null){
        return path;
    }
    var p;
    for (const [key, value] of Object.entries(fileSystem)) {
        p = getAbsolutePathFromPage(path, value);
        if (p != null){
            return key + "/" + p;
        }
    }
    return null;
}

function isValid(absolute){
    var absoluteSplit = absolute.split('/');
    var index = absoluteSplit.indexOf("");
    while (index >= 0){
        absoluteSplit.splice(index, 1);
        index = absoluteSplit.indexOf("");
    }
    var fileSystem = fileStructure;
    for (let i = 0; i < absoluteSplit.length; i++){
        fileSystem = fileSystem[absoluteSplit[i]];
        if (fileSystem == null){
            return false;
        }
    }
    return true;
}

function getDisplayType(){
    return pageDisplayType[filePath.split('/').pop()];
}

function getAbsolutePathFromRelative(relative){
    console.log("Relative: " + relative);
    if (relative.startsWith('/')){
        return relative.substring(1);
    }
    var absoluteSplit = filePath.split("/")
    var index = absoluteSplit.indexOf("");
    while (index >= 0){
        absoluteSplit.splice(index, 1);
        index = absoluteSplit.indexOf("");
    }
    var relativeSplit = relative.split("/");
    index = relativeSplit.indexOf("");
    while (index >= 0){
        relativeSplit.splice(index, 1);
        index = relativeSplit.indexOf("");
    }
    for (let i = 0; i < relativeSplit.length; i++){
        if (relativeSplit[i] == '.'){
            continue;
        } else if (relativeSplit[i] == '..'){
            absoluteSplit.pop();
        } else {
            absoluteSplit.push(relativeSplit[i]);
        }
    }
    return absoluteSplit.join('/');
}

function getRelativePath(path){
    var absolutePath = getAbsolutePathFromPage(path, fileStructure);
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