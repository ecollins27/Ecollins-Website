size = 30
player = [0, 0];
board = new Array(size);
var maxScore = 1000;
var maxTime = 60;
score = maxScore;
for (let i = 0; i < size; i++){
    board[i] = new Array(size);
    for (let j = 0; j < size; j++){
        board[i][j] = true;
//        board[i][j] = between(i, 8, 12) && between(j, 8, 12);
    }
}
var element = document.getElementById("content");
var hedge_character = "@";
var exit;
var started = false;

function displayBoard(decrement){
    var output = "*" + "--".repeat(size + 2) + "*        <span style=\"color:#ffff00;\">HIGH SCORES</span><br>|" + ("<span style=\"color:#00aa00;\">" + hedge_character + "</span> ").repeat(size + 2) + "|";
    if (highScores.length > 0){
        output += "        " + highScores[0];
    }
    output += "<br>";
    for (let i = 0; i < size; i++){
        output += "|" + ("<span style=\"color:#00aa00;\">" + hedge_character + "</span> ");
        for (let j = 0; j < size; j++){
            if (board[i][j]){
                output += ("<span style=\"color:#00aa00;\">" + hedge_character + "</span> ");
            } else if (i == exit[0] && j == exit[1]){
                output += "<span style=\"color:#00ffff;\">X</span> ";
            } else if (i == player[0] && j == player[1]){
                output += "<span style=\"color:#ff0000;\">O</span> ";
            } else {
                output += "  ";
            }
        }
        output += ("<span style=\"color:#00aa00;\">" + hedge_character + "</span> ") + "|";
        if (i + 1 < highScores.length){
            output += "        " + highScores[i + 1];
        }
        output += "<br>";
    }
    output += "|" + ("<span style=\"color:#00aa00;\">" + hedge_character + "</span> ").repeat(size + 2) + "|<br>*" + "--".repeat(size + 2) + "*        Score: " + Math.floor(score);
    element.innerHTML = output;
    if (decrement){
        score = Math.max(0, score - maxScore / maxTime);
    }
}

function between(val, low, high){
    return val >= low && val < high;
}

function createsCycle(pos, from){
    for (let i = -1; i < 2; i++){
        for (let j = -1; j < 2; j++){
            if ((i == 0 && j == 0) || (from[0] != 0 && i == -from[0]) || (from[1] != 0 && j == -from[1])){
                continue;
            }
            if (between(pos[0] + i, 0, size) && between(pos[1] + j, 0, size) && !board[pos[0] + i][pos[1] + j]){
                return true;
            }
        }
    }
    return false;
}

function logQueue(queue){
    var output = "";
    for (let i = 0; i < queue.length; i++){
        output += "(" + queue[i][0] + "," + queue[i][1] + "),";
    }
    console.log(output);
}

function generateMaze(){
    var queue = [[[0, 0],[0,0]]];
    while (queue.length > 0){
        var index = Math.floor(queue.length * Math.random());
        var popped = queue[index];
        queue.splice(index, 1);
        var square = popped[0];
        var direction = popped[1];
        if (board[square[0]][square[1]] && !createsCycle(square, direction)){
            board[square[0]][square[1]] = false;
        } else {
            continue;
        }
        var directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        while (directions.length > 0){
            index = Math.floor(directions.length * Math.random());
            var dir = directions[index];
            directions.splice(index, 1);
            if (between(square[0] + dir[0], 0, size) && between(square[1] + dir[1], 0, size)){
                queue.push([[square[0] + dir[0], square[1] + dir[1]], dir]);
            }
        }
    }
}

function initExit(){
    exit = 0;
    for (let i = 0; i < size; i++){
        for (let j = 0; j < size; j++){
            if (!board[i][j] && i * size + j > exit){
                exit = i * size + j;
            }
        }
    }
    exit = [Math.floor(exit / size), exit % size];
}

function move(dir){
    if (between(player[0] + dir[0], 0, size) && between(player[1] + dir[1], 0, size) && !board[player[0] + dir[0]][player[1] + dir[1]]){
        player[0] += dir[0];
        player[1] += dir[1];
        return true;
    }
    return false;
}

function gameTick(){
    if (player[0] == exit[0] && player[1] == exit[1]){
        fetch("/api/high-score?game=maze&score=" + Math.floor(score)).then(response => {
            window.location.reload();
        });
        return;
    }
    displayBoard(true);
    setTimeout(gameTick, 1000);
}

generateMaze();
initExit();
element.addEventListener("keydown", function(event) {
    console.log(event.key);
    if (event.key == 'a' || event.key == 'A'){
        if (move([0, -1])){
            displayBoard(false);
        }
    } else if (event.key == 's' || event.key == 'S'){
        if (move([1, 0])){
            displayBoard(false);
        }
    } else if (event.key == 'd' || event.key == 'D'){
        if (move([0, 1])){
            displayBoard(false);
        }
    } else if (event.key == 'w' || event.key == 'W'){
       if (move([-1, 0])){
            displayBoard(false);
        }
    }
    if (!started){
        started = true;
        gameTick();
    }
});
document.getElementById("home").addEventListener("click", function(event){
    window.location = "/";
});
element.focus();
displayBoard(false);