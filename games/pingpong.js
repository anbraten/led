#!/usr/bin/env node

var matrix_size = 10;
var tick = 300;
var leds = [];

var gameloop;

// EXPORTS
exports.name = 'Ping Pong - LED Special';

var i = 0;
var j = 0;

exports.init = function init() {
	console.log(exports.name);

	// Rackets of players
	game    = new rect('game', RGB(0, 0, 0), 0, 0, matrix_size, matrix_size);
	ai      = new rect('ai', RGB(0, 255, 0), 0, game.height/2-1, 1, 3);
	player  = new rect('player', RGB(0, 255, 0), game.width-1, game.height/2-1, 1, 3);
	// Ball
	ball    = new rect('ball', RGB(255, 0, 0), 1, game.height/2-1, 1, 1);
	ball.vX = 1;
	ball.vY = 1;

	ai.scores     = 0; // AI points
	player.scores = 0; // Player points

	play();
	gameloop = setInterval(play, tick); // Set refresh interval
}

exports.pause = function pause() {
	if (gameloop) {
		clearInterval(gameloop);
		gameloop = false;
		return;
	}
	gameloop = setInterval(play, tick);
}

exports.render = function render() {
	return leds;
}

exports.input = function input(input) {
	//var stdin = process.openStdin();
	//
	//stdin.on('data', function (data) {
	//	if (data == 'p') pause();
	//	if (data == 'd') debug();
	//	if (data == 'c') process.stdout.write('\x1Bc');
	//	if (data == '\u000D' && !gameloop) play();
	//	if (data == '\u0003') process.exit();
	//});
	//stdin.setEncoding('utf8');
	//stdin.setRawMode(true);
	//stdin.resume();
	switch (input) {
		case 'step':
			exports.stop();
			play();
			break;
		default:
			break;
	}
}

exports.stop = function stop() {
	clearInterval(gameloop);
	gameloop = false;
}

function debug() {
	console.log(game);
	console.log(ai);
	console.log(player);
	console.log(ball);
}

function draw() {
	game.draw();
	// Draw rackets of players
	ai.draw();
	player.draw();
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

function playerMove(e) {
	var y = e.pageY;
	if (player.height/2 + 10 < y && y < game.height - player.height/2 - 10) {
		player.y = y - player.height/2;
	}
}

function update() {
	//aiMove();
	// --- Moving along Y-axis ---
	if (ball.y < 1 || ball.y+ball.height > game.height - 1) {
		// Beat with a "flooring" or "ceiling" of playing field
		ball.vY = -ball.vY;
	}

	// --- Moving along X-axis ---
	if (ball.x < 1) {
		// Beat with a left wall
		ball.vX = -ball.vX;
		player.scores++;
	}

	if (ball.x+ball.width > game.width) {
		// Beat with a right wall
		ball.vX = -ball.vX;
		ai.scores++;
	}

	// Beat with a racket
	if (collision(ai, ball)) {
		console.log('ai');
	}
	if (collision(player, ball)) {
		console.log('player');
	}
	future_ball = new rect('future_ball', ball.color, ball.x, ball.y, ball.width, ball.height);
	future_ball.x += ball.vX;
	future_ball.y += ball.vY;
	if ((collision(ai, future_ball)     && ball.vX<0) ||
		(collision(player, future_ball) && ball.vX>0)) {
		ball.vX = -ball.vX;
		console.log('zug' + ball.vX);
	}

	// Increasing coordinates
	ball.x += ball.vX;
	ball.y += ball.vY;
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
