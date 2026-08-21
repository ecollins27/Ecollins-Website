var board = new Array(24)
var element = document.getElementById("content");
for (let i = 0; i < 24; i++){
    board[i] = new Array(10);
    for (let j = 0; j < 10; j++){
        board[i][j] = 0;
    }
}
var next = 0;
var score = 0;
var level = 0;
// O, I, S, Z, L, J, T
const block_symbols = ["#", "@", "%", "X", "O", "D", "&"];
const block_colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff", "#ffffff"];
const block_shapes = [
    [
    [1, 1],
    [1, 1]
    ],
    [
    [1],
    [1],
    [1],
    [1]
    ],
    [
    [0, 1, 1],
    [1, 1, 0]
    ],
    [
    [1, 1, 0],
    [0, 1, 1]
    ],
    [
    [1, 0],
    [1, 0],
    [1, 1]
    ],
    [
    [0, 1],
    [0, 1],
    [1, 1]
    ],
    [
    [1, 1, 1],
    [0, 1, 0]
    ]
    ]

function displayBoard(){
    var output = "*" + "--".repeat(10) + "*" + "--".repeat(3) + "*<br>";
    var nextBlock = next == 0? []:block_shapes[next - 1];
    for (let i = 4; i < 24; i++){
        output += "|";
        for (let j = 0; j < 10; j++){
            if (board[i][j] == 0){
                output += "  ";
            } else {
                output += "<span style=\"color:" + block_colors[Math.abs(board[i][j]) - 1] + "\";>" + block_symbols[Math.abs(board[i][j]) - 1] + "</span> ";
            }
        }
        if (i == 23){
            output += "|        Level: " + (level + 1) + "<br>";
        } else {
            output += "|";
            if (i - 4 < 4){
                for (let j = 0; j < 3; j++){
                    if (i - 4 >= nextBlock.length || j >= nextBlock[i - 4].length){
                        output += "  ";
                        continue;
                    }
                    if (nextBlock[i - 4][j] == 0){
                        output += "  ";
                    } else {
                        output += "<span style=\"color:" + block_colors[Math.abs(next * nextBlock[i - 4][j]) - 1] + "\";>" + block_symbols[Math.abs(next * nextBlock[i - 4][j]) - 1] + "</span> ";
                    }
                }
                output += "|";
            } else if (i - 4 == 4){
                output = output.substring(0, output.length - 1) + "*" + "--".repeat(3) + "*";
            } else if (i - 4 == 5){
                output += "  " + "<span style=\"color:#ffff00;\">HIGH SCORES</span>";
            } else if (i - 10 < highScores.length){
                output += "  " + highScores[i - 10];
            }
            output += "<br>";
        }
    }
    output += "*" + "--".repeat(10) + "*        Score: " + score;
    element.innerHTML = output;
}

function addBlock(num){
    var block_shape = block_shapes[num - 1];
    for (let i = 0; i < block_shape.length; i++){
        for (let j = 0; j < block_shape[i].length; j++){
            board[i][4 + j] = -block_shape[i][j] * num;
        }
    }
}

function rotate(dir){
    var sum = [0, 0];
    var num = 0;
    for (let i = 0; i < 24; i++){
        for (let j = 0; j < 10; j++){
            if (board[i][j] < 0){
                sum[0] += i;
                sum[1] += j;
                num++;
            }
        }
    }
    sum[0] /= num;
    sum[1] /= num;
    var loc = [0, 0];
    for (let i = 0; i < 24; i++){
        for (let j = 0; j < 10; j++){
            if (board[i][j] < 0){
                loc[0] = Math.round(sum[0] - dir * (j - sum[1]));
                loc[1] = Math.round(sum[1] + dir * (i - sum[0]));
                if (loc[0] < 0 || loc[0] >= 24 || loc[1] < 0 || loc[1] >= 10 || board[loc[0]][loc[1]] > 0){
                    return false;
                }
            }
        }
    }
    var changes = {};
    for (let i = 0; i < 24; i++){
        for (let j = 0; j < 10; j++){
            if (board[i][j] < 0){
                loc[0] = Math.round(sum[0] - dir * (j - sum[1]));
                loc[1] = Math.round(sum[1] + dir * (i - sum[0]));
                changes[loc[0] * 10 + loc[1]] = board[i][j];
                board[i][j] = 0;
            }
        }
    }
    for (key of Object.keys(changes)){
        board[Math.floor(key / 10)][key % 10] = changes[key];
    }
}

function move(dir){
    for (let i = 0; i < 24; i++){
        for (let j = 0; j < 10; j++){
            if (board[i][j] < 0 && (i + dir[0] < 0 || i + dir[0] >= 24 || j + dir[1] < 0 || j + dir[1] >= 10 || board[i + dir[0]][j + dir[1]] > 0)){
                return false;
            }
        }
    }
    for (let i = (dir[0] <= 0? 0:23); dir[0] <= 0? (i < 24): (i >= 0); dir[0] <= 0? (i++):(i--)){
        for (let j = (dir[1] <= 0? 0:9); dir[1] <= 0? (j < 10):(j >= 0); dir[1] <= 0? (j++):(j--)){
            if (board[i][j] < 0){
                board[i + dir[0]][j + dir[1]] = board[i][j];
                board[i][j] = 0;
            }
        }
    }
    return true;
}

function finalize(){
    for (let i = 0; i < 24; i++){
        for (let j = 0; j < 10; j++){
            if (board[i][j] < 0){
                if (i < 4){
                    fetch("/api/high-score?game=tetris&score=" + score).then(response => {
                        window.location.reload();
                    });
                    return;
                }
                board[i][j] *= -1;
            }
        }
    }
    var line;
    var offset = 0;
    for (let i = 23; i >= 0; i--){
        line = true;
        for (let j = 0; j < 10; j++){
            if (board[i][j] == 0){
                line = false;
                break;
            }
        }
        if (line){
            offset++;
            continue;
        } else if (offset > 0){
            for (let j = 0; j < 10; j++){
                board[i + offset][j] = board[i][j];
                board[i][j] = 0;
            }
        }
    }
    switch (offset){
        case 1:
            score += 100;
            break;
        case 2:
            score += 300;
            break;
        case 3:
            score += 500;
            break;
        case 4:
            score += 800;
            break;
    }
    addBlock(next);
    next = Math.floor((7 * Math.random()) + 1);
}

function gameTick(delay){
    if (!move([1, 0])){
        finalize();
    }
    displayBoard();
    if (score >= 10000 * (level + 1)){
        level++;
        delay = 500 * Math.exp(-level / 5);
    }
    setTimeout(gameTick, delay, delay);
}

element.addEventListener("keydown", function(event) {
    if (event.key == 'a' || event.key == 'A'){
        move([0, -1]);
        displayBoard();
    } else if (event.key == 's' || event.key == 'S'){
        move([1, 0]);
        displayBoard();
    } else if (event.key == 'd' || event.key == 'D'){
        move([0, 1]);
        displayBoard();
    } else if (event.key == 'w' || event.key == 'W' || event.key == ' '){
        while (move([1, 0])){}
        finalize();
    } else if (event.key == 'q' || event.key == 'Q'){
        rotate(1);
        displayBoard();
    } else if (event.key == 'e' || event.key == 'E'){
        rotate(-1);
        displayBoard();
    }
});
document.getElementById("home").addEventListener("click", function(event){
    window.location = "/";
});
element.focus();
next = Math.floor(7 * Math.random()) + 1
addBlock(Math.floor(7 * Math.random()) + 1);
gameTick(500);