const DebugConnection = require('./connections/debug');
const buffer = require('./buffer');
const { RGB } = require('./utils/colors');

const leds = [];
let size;
let connection;
let connected = false;

function connect(url) {
  if (/^uart:\/\//.test(url)) {
    const SerialConnection = require('./connections/serial');
    connection = new SerialConnection(url);
  } else if (/^tcp:\/\//.test(url)) {
    const TCPConnection = require('./connections/tcp');
    connection = new TCPConnection(url);
  } else {
    connection = new DebugConnection(url);
  }
  connected = false;
}

function draw() {
  if (!connected) { return; }

  const diffs = buffer.diff(leds);
  for (let i = 0; i < diffs.length; i += 1) {
    const { position, rgb } = diffs[i];
    // TODO: send data correctly
    connection.send(position, rgb.toString());
  }
}

function ledPosition(position, rgb) {
  if (typeof rgb === 'undefined') {
    return;
  }

  leds[position] = rgb;
}

function ledXY(_x, _y, rgb) {
  const x = Math.round(_x);
  const y = Math.round(_y);
  if (x > size - 1 || y > size - 1 || x < 0 || y < 0) {
    return;
  }
  ledPosition(y * size + x, rgb);
}

function toString() {
  const data = [];

  for (let i = 0; i < leds.length; i += 1) {
    if (leds[i]) {
      data.push(leds[i].toString());
    }
  }

  return data.join('');
}

function fill(rgb) {
  for (let i = 0; i < size * size; i += 1) {
    ledPosition(i, rgb);
  }
}

function clear() {
  fill(RGB(0, 0, 0));
}

function init(_size) {
  size = _size;

  // init leds array
  clear();
}

module.exports = {
  init,
  connect,
  clear,
  fill,
  led: ledXY,
  ledPosition,
  ledXY,
  draw,
};
