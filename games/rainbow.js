#!/usr/bin/env node

var matrix_size = 10;
var leds = [];

var tick_time = 300;

var row = [];

var loop;

// EXPORTS
exports.name = 'Rainbow';


exports.init = function init() {
	console.log(exports.name);

	tick();
	toggle_loop();
	allLEDs(RGB(0, 0, 0));
}

exports.pause = function pause() {
	toggle_loop();
}

exports.render = function render() {
	return leds;
}

exports.input = function input(input) {

}

exports.stop = function stop() {
	clearInterval(loop);
	loop = false;
}

function toggle_loop() {
	if (loop) {
		clearInterval(loop);
		loop = false;
		return;
	}
	loop = setInterval(tick, tick_time);
}

function draw() {
	let r = Math.floor((Math.random() * 255));
	let g = Math.floor((Math.random() * 255));
	let b = Math.floor((Math.random() * 255));
	row[0] = RGB(r, g, b);
	for (var i = 1; i < 10; i++) {
		row[i] = row[i - 1];
		for (var j = 0; j < 10; j++) {
			LED(j, i, row[i]);
		}
	}
}

function update() {

}

function tick() {
	draw();
	update();
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
