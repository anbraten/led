#!/usr/bin/env node

var matrix_size = 10;
var tick = 200;
var leds = [];

var loop;

// EXPORTS
exports = module.exports = {
	'name':         'jumpNrun',
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

	update();
	loop = setInterval(update, tick); // Set refresh interval
}

function getInputs() {
	return [
	];
}

function getTeams() {
	return {
	};
}

function pause() {
	if (loop) {
		clearInterval(loop);
		loop = false;
		return;
	}
	loop = setInterval(update, tick);
}

function render() {
	return leds;
}

function input(input) {
}

function stop() {
	clearInterval(loop);
	loop = false;
}

function debug() {
	console.log(game);
	console.log(players[0]);
	console.log(players[1]);
	console.log(ball);
}

function update() {
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
