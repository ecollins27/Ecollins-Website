var current_dir = [0, 0];
var size = 20;
var board = new Array(size)
var head = [size/2, size/2]
var apple = [size/2, size/2]
var length = 0;
var element = document.getElementById("content");
for (let i = 0; i < size; i++){
    board[i] = new Array(size);
    for (let j = 0; j < size; j++){
        board[i][j] = size * size;
    }
}
board[head[0]][head[1]] = 0;

function displayBoard(){
    var output = "*" + "--".repeat(size) + "*        <span style=\"color:#ffff00;\">HIGH SCORES</span><br>";
    for (let i = 0; i < size; i++){
        output += "|";
        for (let j = 0; j < size; j++){
            if (i == head[0] && j == head[1]){
                output += "<span style=\"color:#00ff00;\">O</span> ";
            } else if (i == apple[0] && j == apple[1]){
                output += "<span style=\"color:#ff0000;\">@</span> ";
            } else if (board[i][j] <= length){
                output += "<span style=\"color:#00ffff;\">#</span> ";
            } else {
                output += "  ";
            }
        }
        output += "|";
        if (i < highScores.length){
            output += "        " + highScores[i];
        }
        output += "<br>";
    }
    output += "*" + "--".repeat(size) + "*        Score: " + length;
    element.innerHTML = output;
}

function gameTick(){
    if (head[0] == apple[0] && head[1] == apple[1]){
        while (board[apple[0]][apple[1]] <= length){
            apple[0] = Math.floor(Math.random() * size);
            apple[1] = Math.floor(Math.random() * size);
        }
        length++;
    }
    head[0] += current_dir[0];
    head[1] += current_dir[1];
    if (head[0] < 0 || head[0] >= size || head[1] < 0 || head[1] >= size){
        fetch("/api/high-score?game=snake&score=" + length).then(response => {
            window.location.reload();
        });
        return;
    }
    for (let i = 0; i < size; i++){
        for (let j = 0; j < size; j++){
            board[i][j]++;
        }
    }
    if (board[head[0]][head[1]] <= length){
        fetch("/api/high-score?game=snake&score=" + length).then(response => {
            window.location.reload();
        });
        return;
    }
    board[head[0]][head[1]] = 0;
    displayBoard(element, size, board, head, apple, length);
    setTimeout(gameTick, 250);
}

element.addEventListener("keydown", function(event) {
    var new_dir = [0, 0];
    if (event.key == 'a' || event.key == 'A'){
        new_dir = [0, -1];
    } else if (event.key == 's' || event.key == 'S'){
        new_dir = [1, 0];
    } else if (event.key == 'd' || event.key == 'D'){
        new_dir = [0, 1];
    } else if (event.key == 'w' || event.key == 'W'){
        new_dir = [-1, 0];
    }
    if (head[0] + new_dir[0] >= 0 && head[0] + new_dir[0] < size && head[1] + new_dir[1] >= 0 && head[1] + new_dir[1] < size && board[head[0] + new_dir[0]][head[1] + new_dir[1]] <= 1){
        return;
    }
    var startGame = current_dir[0] == 0 && current_dir[1] == 0;
    current_dir[0] = new_dir[0];
    current_dir[1] = new_dir[1];
    displayBoard();
    if (startGame){
        gameTick();
    }
});
document.getElementById("home").addEventListener("click", function(event){
    window.location = "/";
});
element.focus();
displayBoard();