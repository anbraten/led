#!/usr/bin/env node

var matrix_size = 10;
var tick = 600;
var leds = [];

var loop;

var tree;
var snowflakes;

// EXPORTS
exports = module.exports = {
	'name':         'Christmas',
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

	allLEDs(RGB(0,0,0));

	tree = new Tree('tree');
	snowflakes = new Drops(30, 1, RGB(255, 255, 255));

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
	snowflakes.draw();
	tree.draw();
}

function update() {
	snowflakes.update();
	tree.update();
	draw();
}

function Balls() {
	if (balls == null)
		balls = [];
}

function Tree(name) {
	this.name	= name;
	this.green = [
		[1, 4], [1, 5],
		[2, 4], [2, 5],
		[3, 3], [3, 4], [3, 5], [3, 6],
		[4, 3], [4, 4], [4, 5], [4, 6],
		[5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7],
		[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8],
		[7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9]
	];
	this.trunk = [
		[8, 4], [8, 5],
		[9, 4], [9, 5]
	];
	this.snow = [
		[9, 0], [9, 1], [9, 2], [9, 3], [9, 6], [9, 7], [9, 8], [9, 9]
	]
	this.balls = [
		[7, 0], [3, 6], [6, 8], [5, 2], [6, 5],	[1, 4],	[4, 4]
	];

	this.update = function() {

	};

	this.draw = function() {
		// green
		for (var i = 0; i < this.green.length; i++)
			LED(this.green[i][1], this.green[i][0], RGB(0, 100, 0));
		// trunk
		for (var i = 0; i < this.trunk.length; i++)
			LED(this.trunk[i][1], this.trunk[i][0], RGB(139, 69, 19));
		// snow
		for (var i = 0; i < this.snow.length; i++)
			LED(this.snow[i][1], this.snow[i][0], RGB(255, 255, 255));
		// balls
		for (var i = 0; i < this.balls.length; i++)
			LED(this.balls[i][1], this.balls[i][0], RGB(204, 0, 0));
	}
}

function Drops(chance, multiple, color) {
	this.chance = chance;
	this.multiple = multiple;
	this.color = color;
	this.drops = new Array();

	this.update = function() {
		// del landed drops
		for (var i = 0; i < this.drops.length; i++)
			if (this.drops[i].y == 9)
				this.drops.splice(i, 1);

		// move drops
		for (var i = 0; i < this.drops.length; i++)
			this.drops[i].y = this.drops[i].y + 1;

		// add new drops
		if (rnd(0, 100) < this.chance)
			for (var i = 0; i < rnd(1, this.multiple); i++)
				this.drops.push(new Rect('drop', this.color, rnd(0, 10), 0, 1, 1));
	}

	this.draw = function() {
		for (var i = 0; i < this.drops.length; i++)
			this.drops[i].draw();
	}
}

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

// HELPER

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
