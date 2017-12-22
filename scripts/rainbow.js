#!/usr/bin/env node

var matrix_size = 10;
var tick = 400;
var leds = [];

var loop;

var cloud;
var drops;

// EXPORTS
exports = module.exports = {
	'name':         'Rainbow',
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

	for (var i = 0; i < matrix_size * matrix_size; i++) {
		leds[i] = RGB(0, 0, 0);
	}

	cloud = new Rect('cloud', RGB(0, 0, 255), 0, 0, 10, 1);
	drops = new Array();

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
}

function draw() {
	allLEDs(RGB(0, 0, 0));
	cloud.draw();
	for (var i = 0; i < drops.length; i++) {
		drops[i].draw();
	}
}

function update() {
	cloud.color = rndColor();

	// del landed drops
	for (var i = 0; i < drops.length; i++) {
		if (drops[i].y == 9) {
			drops.splice(i, 1);
		}
	}

	// move drops
	for (var i = 0; i < drops.length; i++) {
		drops[i].y = drops[i].y + 1;
	}

	// add new drops
	if (rnd(0, 4) > 1) {
		for (var i = 0; i < rnd(0, 3); i++) {
			drops.push(new Rect('drop', cloud.color, rnd(0, 10), 1, 1, 1));
		}
	}

	console.log(drops);

	draw();
}

// HELPER

function Rect(name, color, x, y, width, height) {
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

function rnd(min, max) {
	return Math.floor((Math.random() * max) + min);
}

function rndColor() {
	return RGB(rnd(0, 255), rnd(0, 255), rnd(0, 255));
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
