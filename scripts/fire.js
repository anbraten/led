#!/usr/bin/env node

var matrix_size = 10;
var leds = [];

var tick_time = 300;

var row = [];

var loop;

var line = [];
var matrixValue = [];
var pcnt = 0;

//these values are substracetd from the generated values to give a shape to the animation
var valueMask = [
	[255, 192, 160, 128, 128, 128, 128, 160, 192, 255],
	[255, 192, 160, 128, 128, 128, 128, 160, 192, 255],
	[255, 160, 128, 96 , 96 , 96 , 96 , 128, 160, 255],
	[192, 128, 96 , 64 , 64 , 64 , 64 , 96 , 128, 192],
	[160, 96 , 64 , 32 , 32 , 32 , 32 , 64 , 96 , 160],
	[128, 64 , 32 , 0  , 0  , 0  , 0  , 32 , 64 , 128],
	[96 , 32 , 0  , 0  , 0  , 0  , 0  , 0  , 32 , 96 ],
	[64 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 64 ],
	[32 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 32 ],
	[32 , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 0  , 32 ]
];

//these are the hues for the fire,
//should be between 0 (red) to about 25 (yellow)
var hueMask = [
    [1 , 11, 25, 22, 11, 11, 19, 25, 11, 1 ],
    [1 , 8 , 25, 19, 8 , 8 , 13, 25, 8 , 1 ],
    [1 , 8 , 19, 16, 8 , 8 , 13, 19, 8 , 1 ],
    [1 , 8 , 19, 16, 8 , 8 , 13, 19, 8 , 1 ],
    [1 , 5 , 13, 13, 5 , 5 , 11, 13, 5 , 1 ],
    [1 , 5 , 11, 11, 5 , 5 , 11, 11, 5 , 1 ],
    [0 , 1 , 8 , 5 , 1 , 1 , 5 , 8 , 1 , 0 ],
    [0 , 0 , 5 , 1 , 0 , 0 , 1 , 5 , 0 , 0 ],
    [0 , 0 , 1 , 0 , 0 , 0 , 0 , 1 , 0 , 0 ],
    [0 , 0 , 1 , 0 , 0 , 0 , 0 , 1 , 0 , 0 ]
];

// EXPORTS
exports.name = 'Fire';


exports.init = function init() {
	console.log(exports.name);
	matrixValue = new Array(10);
	for (var i = 0; i < matrix_size**2; i++) {
		matrixValue[i] = new Array(matrix_size);
		for (var j = 0; j < matrix_size**2; j++) {
			matrixValue[i][j] = 0;
		}
	}
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

/**
 * Randomly generate the next line (matrix row)
 */
function generateLine(){
	for(var x = 0; x < matrix_size; x++) {
		line[x] = rnd(64, 255);
	}
}

/**
 * shift all values in the matrix up one row
 */
function shiftUp() {
	for (var y = matrix_size-1; y > 0; y--) {
		for (var x = 0; x < matrix_size; x++) {
			matrixValue[y][x] = matrixValue[y-1][x];
		}
	}

	for (var x = 0; x < matrix_size; x++) {
		matrixValue[0][x] = line[x];
	}
}

/**
 * draw a frame, interpolating between 2 "key frames"
 * @param pcnt percentage of interpolation
 */
function drawFrame(pcnt) {
	var nextv;

	//each row interpolates with the one before it
	for (var y = matrix_size - 1; y > 0; y--) {
		for (var x = 0; x < matrix_size; x++) {
			nextv = (((100.0-pcnt)*matrixValue[y][x] + pcnt*matrixValue[y-1][x])/100.0) - valueMask[y][x];
			var color = HSVtoRGB(
				hueMask[y][x], // H
				255, // S
				Math.max(0, nextv) // V
			);
			LED(x, y, color);
		}
	}

	//first row interpolates with the "next" line
	for(var x = 0; x < matrix_size; x++) {
		var color = HSVtoRGB(
			hueMask[0][x], // H
			255,           // S
			(((100.0-pcnt)*matrixValue[0][x] + pcnt*line[x])/100.0) // V
		);
		LED(x, 0, color);
	}
}

function update() {
	if (pcnt >= 100) {
		shiftUp();
		generateLine();
		pcnt = 0;
	}
	drawFrame(pcnt);
	pcnt+=30;
}

function tick() {
	update();
}

// HELPER

function rnd(min, max) {
	return min + Math.floor(Math.random() * max);
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


/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}