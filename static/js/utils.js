const animationLength = 1000;
export const manifest = await getContents("/static/manifest.json");
export const fileStructure = JSON.parse(manifest);
export var filePath = window.location.pathname.substring(1);
console.log(filePath);
if (isFile(filePath)){
    filePath = filePath.split('/').slice(0, -1).join('/');
}

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

export function getParams(url){
    var params = {};
    var paramString = url.split("?").pop();
    var paramSplit = paramString.split('&');
    for (let i = 0; i < paramSplit.length; i++){
        var spl = paramSplit[i].split('=');
        params[spl[0]] = spl[1];
    }
    return params;
}

export async function getContents(path){
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error('Filed to load ${path}');
    }
    return await response.text();
}

export function addImage(parentElement, src, height, caption){
    var absoluteSrc = getAbsolutePath(src);
    var html = "<span class=\"image_wrapper\">\n<img class=\"ghost\" src=\"/static/home/" + absoluteSrc + "\" height=" + height + "px>\n<div id=\"" + src + "\" class=\"img_container\">\n<img src=\"/static/home/" + absoluteSrc + "\" height=" + height + "px>\n</div>\n<span class=\"image_caption\">" + caption + "</span></span>";
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

export function addVideo(parentElement, width, height, src){
    var absoluteSrc = getAbsolutePath(src);
    var html = "<video width=\"" + width + "\" height=\"" + height + "\" autoplay><source src=\"/static/home/" + absoluteSrc + "\" type=\"video/" + src.split(".").pop() + "\"></video>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var ghost = "<img width=\"" + width + "\" height=\"" + height + "\">";
    return ghost;
}

export function calculateDelays(textLength){
    var delay = Math.floor(animationLength / textLength);
    var char_per_tick = 1;
    if (delay == 0){
        char_per_tick = Math.ceil(textLength / animationLength);
    }
    return [delay, char_per_tick];
}

export function isValid(absolute){
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

export function isFile(absolutePath){
    var fileSystem = fileStructure;
    var absoluteSplit = absolutePath.split("/");
    for (let i = 0; i < absoluteSplit.length; i++){
        if (absoluteSplit[i] != ""){
            fileSystem = fileSystem[absoluteSplit[i]];
        }
    }
    return Object.keys(fileSystem).length == 0;
}

export function getAbsolutePath(relative){
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

export function getRelativePath(path){
    var absolutePath = getAbsolutePath(path);
    const absoluteSplit = absolutePath.split("/");
    var index = absoluteSplit.indexOf("");
    while (index >= 0){
        absoluteSplit.splice(index, 1);
        index = absoluteSplit.indexOf("");
    }
    const fileSplit = filePath.split("/");
    index = fileSplit.indexOf("");
    while (index >= 0){
        fileSplit.splice(index, 1);
        index = fileSplit.indexOf("");
    }
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