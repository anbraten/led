#!/usr/bin/env node

const SerialPort = require('serialport');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const fs = require('fs');

var serial_ready = false;
var clients = [];
var connected_clients = 0;

//var auto_lunch = 'pingpong.js';
var auto_lunch = null;

var script;
var leds;

var port = new SerialPort('/dev/ttyUSB0', {
	baudRate: 115200,
	autoOpen: false
});

console.log('LED Server 0.1');

// SERIAL
port.on('open', () => {
	port.on('data', (data) => {
		if(data == 'ready'){
			console.log('serial connected');
			serial_ready = true;
			if (auto_lunch)
				launch_script(auto_lunch);
		}
	});
});

port.on('close', () => {
	console.log('serial closed');
	serial_ready = false;
	connect_serial();
});

// open errors will be emitted as an error event
port.on('error', (err) => {
	console.log('Error: ', err.message);
});

connect_serial();

// EXPRESS

app.use(express.static(__dirname + '/public'));
app.ws('/ws', (ws, req) => {
	var id = connected_clients;
	clients[id] = ws;
	connected_clients++;
	ws.on('message', (msg) => {
		let data;
		try {
			data = JSON.parse(msg);
		} catch(e) {
		}
		switch(data.type) {
			case 'status':
				send(id, data.assign, serial_ready);
				break;
			case 'list_scripts':
				list_scripts(id, data.assign);
				break;
			case 'launch_script':
				launch_script(data.script);
				break;
			case 'stop_script':
				stop_script();
				break;
			case 'running_script':
				if (script)
					send(id, data.assign, script.id);
				else
					send(id, data.assign, null);
				break;
			case 'inputs':
				if (script)
					send(id, data.assign, script.getInputs());
				break;
			case 'leds':
				let res = [];
				for (var i = 0; i < leds.length; i++) {
					res[LED(i)] = leds[i];
				}
				send(id, data.assign, res);
				break;
			case 'input':
				if (script)
					script.input(data.event);
				break;
			case 'ping':
				send(id, data.assign, Date.now());
				break;
			default:
				console.log(msg);
				break;
		}
	});
	ws.on('close', () => {
		delete clients[id];
		connected_clients--;
	});
});

app.listen(80);

renderLEDs();
setInterval(renderLEDs, 50);

// FUCNTIONS

function list_scripts(client_id, assign) {
	let dir = __dirname + '/scripts';
	fs.readdir(dir, function (err, files) {
		send(client_id, assign, files);
	});
}

// pingpong, space invaders, snake, tetris, car race
function launch_script(script_name) {
	if (script)
		stop_script();
	script = require(__dirname + '/scripts/' + script_name);
	script.id = script_name;
	script.init();
}

function stop_script() {
	if (script) {
		script.stop();
		delete require.cache[__dirname + '/scripts/' + script.id];
		script = null;
	}
}

function renderLEDs() {
	if (script)
		leds = script.render();
	else
		leds = Matrix(100, RGB(0, 0, 0));
	var data = [];
	for (var i = 0; i < leds.length; i++) {
		data.push(leds[i].r);
		data.push(leds[i].g);
		data.push(leds[i].b);
	}
	if (serial_ready) {
		port.write(data, 'binary', (err) => {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
		});
	}
}

// HELPERS

function send(client_id, assign, data) {
	if(client_id in clients) {
		let client = clients[client_id];
		if (client.readyState !== client.OPEN)
			return;
		data = {
			'type': 'result',
			'assign': assign,
			'content': data
		};
		client.send(JSON.stringify(data));
	}
}

function connect_serial() {
	port.open((err) => {
		if (err)
			setTimeout(connect_serial, 1000);
	});
}

function LED(id) {
	let matrix_size = 10;
	x = id % matrix_size;
	y = Math.floor(id / matrix_size);
	//console.log();
	//console.log(x + ' : ' + y);
	if (y % 2 == 0)
		x = matrix_size - x - 1;
	//console.log(x + ' : ' + y);
	return x * matrix_size + y;
}

function Matrix(size, rgb) {
	var result = [];
	for (var i = 0; i < size; i++) {
		result[i] = rgb;
	}
	return result;
}

function RGB(r, g, b) {
	return {
		'r': r,
		'g': g,
		'b': b
	};
}

