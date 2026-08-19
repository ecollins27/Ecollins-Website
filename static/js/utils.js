const animationLength = 1000;
export const manifest = await getContents("/static/manifest.json");
export const fileStructure = JSON.parse(manifest);
export var filePath = window.location.pathname.substring(1);
if (isValid(filePath) && isFile(filePath)){
    filePath = filePath.split('/').slice(0, -1).join('/');
}

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

var executable_extensions = [".bin", ".sh"]

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

export function onMobile(){
//    return true;
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

export async function getContents(path){
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error('Failed to load ${path}');
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

export function addListHeader(parentElement, name, id, color, num){
    var html = "<span class=\"list-header\" id=\"" + id + "_" + num + "\" data-text=\"\">" + name + "<span>";
    var mobile = onMobile();
    parentElement.insertAdjacentHTML("beforeend", html);
    var element = document.getElementById(id + "_" + num);
    element.addEventListener(mobile? "click":"mouseover", function(event) {
        var optionIds = element.dataset.text.split(',');
        var optionElement;
        for (var optionId of optionIds){
            if (optionId != ""){
                optionElement = document.getElementById(optionId);
                console.log(optionElement.style.visibility);
                optionElement.style.visibility = mobile? (optionElement.style.visibility == 'visible'? 'hidden':'visible'):'visible';
            }
        }
    });
    if (!mobile){
        element.addEventListener("mouseout", function(event) {
            var optionIds = element.dataset.text.split(',');
            for (var optionId of optionIds){
                if (optionId != "" && document.getElementById(optionId).matches(":hover")){
                    return;
                }
            }
            for (var optionId of optionIds){
                if (optionId != ""){
                    document.getElementById(optionId).style.visibility='hidden';
                }
            }
        });
    }
    return "<span class=\"list-header\" id=\"ghost_" + id + "_" + num + "\" data-text=\"\">" + name + "<span>";
}

export function addListHeaderWithButton(parentElement, name, id, path, color, num, addButton){
    var html = "<span class=\"list-header\" id=\"" + id + "_" + num + "\" data-text=\"\" style=\"border: 0px;\"><span>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var element = document.getElementById(id + "_" + num);
    var ghostHtml = addButton(element, name, path, color, num);
    element.addEventListener("mouseover", function(event) {
        var optionIds = element.dataset.text.split(',');
        for (var optionId of optionIds){
            if (optionId != ""){
                document.getElementById(optionId).style.visibility='visible';
            }
        }
    });

    element.addEventListener("mouseout", function(event) {
        var optionIds = element.dataset.text.split(',');
        for (var optionId of optionIds){
            if (optionId != "" && document.getElementById(optionId).matches(":hover")){
                return;
            }
        }
        for (var optionId of optionIds){
            if (optionId != ""){
                document.getElementById(optionId).style.visibility='hidden';
            }
        }
    });
    return "<span class=\"list-header\" id=\"ghost_" + id + "_" + num + "\" data-text=\"\">" + ghostHtml + "<span>";
}

export function addListOption(parentElement, headerId, content, path, color, num, addButton){
    var headerElement = document.getElementById(headerId);
    var optionIds = headerElement.dataset.text.split(',');
    var id = headerId + "_" + (optionIds[0] == ""? 0:(optionIds.length));
    var html = "<span class=\"list-option\" id=\"" + id + "\" data-text=\"" + headerId + "\">└─</span>";
    parentElement.insertAdjacentHTML("beforeend", html);
    var optionElement = document.getElementById(id);
    var ghostHtml = addButton(optionElement, content, path, color, num);
    if (optionIds[0] == ""){
        optionIds = optionIds.slice(1);
    } else {
        document.getElementById(optionIds[optionIds.length - 1]).firstChild.textContent = "├─";
    }
    optionIds.push(id);
    headerElement.dataset.text = optionIds.join(",");
    const parentRect = parentElement.getBoundingClientRect();
    const rect = headerElement.getBoundingClientRect();
    optionElement.style.left = (rect.left - parentRect.left) + "px";
    optionElement.addEventListener("mouseout", function(event) {
        var optionIds = headerElement.dataset.text.split(',');
        for (var optionId of optionIds){
            if (optionId != "" && document.getElementById(optionId).matches(":hover")){
                return;
            }
        }
        for (var optionId of optionIds){
            if (optionId != ""){
                document.getElementById(optionId).style.visibility='hidden';
            }
        }
    });
    return "<span class=\"list-option\" id=\"ghost_" + id + "\" data-text=\"" + headerId + "\" style=\"left:" + (rect.left - parentRect.left) + "px\">└─" + ghostHtml + "</span>";
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

export function isExecutable(absolutePath){
    for (let i = 0; i < executable_extensions.length; i++) {
        if (absolutePath.endsWith(executable_extensions[i])){
            return true;
        }
    }
    return absolutePath.split("/").pop().indexOf(".") == -1;
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