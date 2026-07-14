function fillContent(element, text, colors, delay, char_per_tick, index){
    if (index < text.length) {
        var color;
        for (let i = 0; i < char_per_tick; i++){
            if (index >= text.length){
                break;
            }
            color = colors[index];
            character = text[index];
            if (character == '{'){
                close = text.indexOf("}", index + 2);
                data = text.substring(index + 2, close).split(",");
                elementType = text[index + 1];
                index = close;
                if (elementType == 'b'){
                    addButton(null, null, element, data[0], data[1], data[2]);
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
        setTimeout(fillContent, delay, element, text, colors, delay, char_per_tick, index);
    }
}

document.getElementById("exit").addEventListener("click", function(event) {
    window.location = document.referrer;
});

document.getElementById("terminal").addEventListener("click", function(event) {
    window.location = '/' + filePath.substring(0, filePath.length - 5);
});

var element = document.getElementById("nano_content")
var text = content.value;
var [delay, char_per_tick] = calculateDelays(text.length);

var buttons = ["home", "about", "projects", "cats"];
for (let i = 0; i < buttons.length; i++){
    document.getElementById(buttons[i]).addEventListener("click", function(event){
        goTo(buttons[i]);
    });
}
setTimeout(fillContent, 100, element, text, content.colors, delay, char_per_tick, 0)