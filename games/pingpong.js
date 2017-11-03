#!/usr/bin/env node

var matrix_size = 10;
var tick = 200;
var leds = [];

var gameloop;

var i = 0;
var j = 0;

var game;
var players = [];
var ball;

// EXPORTS
exports = module.exports = {
	'name':         'Ping Pong - Led Special',
	'init': 		init,
	'getInputs': 	getInputs,
	'getTeams': 	getTeams,
	'pause': 		pause,
	'render': 		render,
	'input': 		input,
	'stop': 		stop
};

function init() {
	console.log(exports.name);

	// Rackets of players
	game    	= new rect('game', RGB(0, 0, 0), 0, 0, matrix_size, matrix_size);
	players[0]   = new rect('player0', RGB(0, 255, 0), 0, game.height/2-1, 1, 3);
	players[1]  	= new rect('player1', RGB(0, 255, 0), game.width-1, game.height/2-1, 1, 3);

	// Ball
	ball    = new rect('ball', RGB(255, 0, 0), game.width/2, game.height/2, 1, 1);
	ball.vX = 1;
	ball.vY = 1;

	players[0].scores = 0; // Player 0 points
	players[1].scores = 0; // Player 1 points

	//setup specific situations
	//player[0].y = player[0].y - 2;
	ball.x = ball.x - 2;

	play();
	gameloop = setInterval(play, tick); // Set refresh interval
}

function getInputs() {
	return [
		'left',
		'right'
	];
}

function getTeams() {
	return {
		'0': 'A',
		'1': 'B'
	};
}

function pause() {
	if (gameloop) {
		clearInterval(gameloop);
		gameloop = false;
		return;
	}
	gameloop = setInterval(play, tick);
}

function render() {
	return leds;
}

function input(input) {
	input = (input instanceof Object) ? input : {'event': input};
	var team = (input['team'] == 'A') ? 0 : 1;
	switch (input['event']) {
		case 'left':
			playerMove(team, input['event']);
			break;
		case 'right':
			playerMove(team, input['event']);
			break;
		case 'step':
			exports.stop();
			play();
			break;
		default:
			break;
	}
}

function stop() {
	clearInterval(gameloop);
	gameloop = false;
}

function debug() {
	console.log(game);
	console.log(players[0]);
	console.log(players[1]);
	console.log(ball);
}

function draw() {
	game.draw();
	// Draw rackets of players
	players[0].draw();
	players[1].draw();
	// Draw ball
	ball.draw();
}

function rect(name, color, x, y, width, height) {
	this.name	= name;
	this.color  = color;
	this.x      = x;
	this.y      = y;
	this.width  = width;
	this.height = height;
	this.draw   = function() {
		// Draw playing object
		for (var i = 0; i < this.width; i++) {
			for (var j = 0; j < this.height; j++) {
				LED(this.x + i, this.y + j, this.color);
			}
		}
		//console.log(this)
	}
}

function playerMove(team, e) {
	var vY = (e == 'left') ? -1 : 1;
	var yStart = players[team].y + vY;
	var yEnd = yStart + players[team].height;
	if (0 <= yStart && game.height >= yEnd) {
		players[team].y += vY;
	}
}

function update() {
	//aiMove();

	// Increasing coordinates
	ball.x += ball.vX;
	ball.y += ball.vY;

	// --- Moving along X-axis ---

	if (collision(players[0], ball)) {
		// console.log('players[0]');

		if(ball.vY > 0 && players[0].y == ball.y || ball.vY < 0 && players[0].y + players[0].height - 1 == ball.y){
			ball.vX = -ball.vX;
			ball.vY = -ball.vY;
			ball.x += ball.vX * 2;
			ball.y += ball.vY * 2;
		} else {
			ball.vX = -ball.vX;
			ball.x += ball.vX * 2;
		}
	} else if (ball.x < 1) { //else if for clarification PLS change
		// Beat with a left wall
		ball.vX = -ball.vX;
		players[1].scores++;
	}

	if (collision(players[1], ball)) {
		// console.log('player');

		if(ball.vY > 0 && players[1].y == ball.y || ball.vY < 0 && players[1].y + players[1].height - 1 == ball.y){
			ball.vX = -ball.vX;
			ball.vY = -ball.vY;
			ball.x += ball.vX * 2;
			ball.y += ball.vY * 2;
		} else {
			ball.vX = -ball.vX;
			ball.x += ball.vX * 2;
		}
	} else if (ball.x + ball.width > game.width - 1) {
		// Beat with a right wall
		ball.vX = -ball.vX;
		players[0].scores++;
	}

	// --- Moving along Y-axis ---
	if (ball.y < 1 || ball.y + ball.height > game.height - 1) {
		// Beat with a "flooring" or "ceiling" of playing field
		ball.vY = -ball.vY;
	}


	// Beat with a racket
	/*if (collision(ai, ball)) {
		console.log('ai');
	}*/
	/*if (collision(player, ball)) {
		console.log('player');
		ball.vX = -ball.vX;
		ball.x += ball.vX;
	}*/
	//future_ball = new rect('future_ball', ball.color, ball.x, ball.y, ball.width, ball.height);
	//future_ball.x += ball.vX;
	//future_ball.y += ball.vY;
	/*if ((collision(ai, ball) && ball.vX<0) ||
		(collision(player, ball) && ball.vX>0)) {
		ball.vX = -ball.vX;
		console.log('zug' + ball.vX);
	}*/
}

function play() {
	draw();
	update();
}

function collision(A, B) {
	if (A.x < B.x + B.width &&
		A.x + A.width > B.x &&
		A.y < B.y + B.height &&
		A.height + A.y > B.y) {
			return true;
	}
	return false;
}

function aiMove() {
	var y;
	var vY = Math.abs(ball.vY) - 0.75;

	if (ball.y < ai.y + ai.height / 2) {
		y = ai.y - vY;
	}
	if (ball.y > ai.y + ai.height / 2) {
		y = ai.y + vY;
	}
	if (1 < y && y < game.height - ai.height - 1) {
		ai.y = y;
	}
}

// HELPER

function allLEDs(rgb) {
	for (let i = 0; i < matrix_size * matrix_size; i++)
		leds[i] = rgb;
}

function LED(x, y, rgb) {
	x = Math.round(x);
	y = Math.round(y);
	if (x > matrix_size - 1 || y > matrix_size - 1 || x < 0 || y < 0)
		return;
	if (x % 2 == 0)
		y = matrix_size - y - 1;
	setLED(x * matrix_size + y, rgb);
}

function setLED(id, rgb) {
	leds[id] = rgb;
}

function RGB(r, g, b) {
	return {
		'r': r,
		'g': g,
		'b': b
	};
}
