#!/usr/bin/env node

var matrix_size = 10;
var tick = 300;
var leds = [];

var gameloop;

// EXPORTS
exports.name = 'Skeleton - LED Special';

exports.init = function init() {
	console.log(exports.name);

	// TODO init

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
	switch (input) {
		// TODO input
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

exports.debug = function debug() {
	return 'debug';
}

function draw() {
	// TODO draw
}


function update() {
	// TODO update
}

function play() {
	draw();
	update();
}

// HELPER
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
	}
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
