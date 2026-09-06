const width = 40
const height = 30
var ball = [Math.floor(height / 2), Math.floor(width / 2)];
const startAngle =  Math.PI / 6.0 + Math.random() * 2 * Math.PI / 3;
var ball_vel = [Math.cos(startAngle), Math.sin(startAngle)];
const paddle_length = 6;
var left = Math.floor(height / 2) - Math.floor(paddle_length / 2);
var right = Math.floor(height / 2) - Math.floor(paddle_length / 2);
const cpu_speed = 1;
const left_tick = 1;
var element = document.getElementById("content");
var startGame = false;
var score = 0;
const speed_mul = 1.05;

function displayBoard(){
    var output = "*" + "--".repeat(width) + "*        HIGH SCORES<br>";
    for (let i = 0; i < height; i++){
        output += "|";
        for (let j = 0; j < width; j++){
            if (j == 1 && i >= Math.floor(left) && i < Math.floor(left) + paddle_length){
                output += " |";
            } else if (j == width - 2 && i >= Math.floor(right) && i < Math.floor(right) + paddle_length){
                output += "| ";
            } else if (i == Math.floor(ball[0]) && j == Math.floor(ball[1])){
                output += "<span style=\"color:#ff0000\">O</span> ";
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
    output += "*" + "--".repeat(width) + "*        Score: " + score;
    element.innerHTML = output;
}

function gameTick(){
    displayBoard();
    const old_pos = [ball[0], ball[1]];
    ball[0] += ball_vel[0];
    ball[1] += ball_vel[1];
    if (ball[1] < -Math.pow(speed_mul, score + 1)){
        fetch("/api/high-score?game=pong&score=" + score).then(response => {
            window.location.reload();
        });
        return;
    } else if (ball[1] > width + Math.pow(speed_mul, score + 1)){
        ball[0] = Math.floor(height / 2);
        ball[1] = Math.floor(width / 2);
    }
    if (ball[0] <= 0){
        ball_vel[0] *= -1;
        ball[0] *= -1;
    } else if (ball[0] >= height){
        ball_vel[0] *= -1;
        ball[0] = height - (ball[0] - height);
    }

    if (ball[1] <= 1 && old_pos[1] > 1){
        var intersect = old_pos[0] + ((old_pos[1] - 1) / (old_pos[1] - ball[1])) * (old_pos[0] - ball[0]);
        if (intersect >= left && intersect <= left + paddle_length){
            ball_vel[0] *= speed_mul;
            ball_vel[1] *= -speed_mul;
            ball[1] = 1 + (1 - ball[1]);
            score++;
        }
    } else if (ball[1] >= width - 2 && old_pos[1] < width - 2){
        ball_vel[1] *= -1;
        ball[1] = width - 2 - (ball[1] - (width - 2));
    }
    right = Math.min(height - paddle_length, Math.max(0, ball[0] - paddle_length / 2));
    setTimeout(gameTick, 100);
}

document.getElementById("home").addEventListener("click", function(event){
    window.location = "/";
});
element.addEventListener("keydown", function(event) {
    console.log(event.key);
    if (event.key == 'w' || event.key == 'W'){
        left = Math.max(0, left - left_tick);
    } else if (event.key == 's' || event.key == 'S'){
        left = Math.min(height - paddle_length, left + left_tick);
    }
    if (!startGame){
        gameTick();
        startGame = true;
    }
});
element.focus();
displayBoard();