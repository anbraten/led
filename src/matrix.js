const EventEmitter = require('events');
const Remotes = require('./remotes');

class MyEmitter extends EventEmitter {}
const systemEvents = new MyEmitter();
const scriptEvents = new MyEmitter();

let size = 0;
const leds = [];
const buffer = [];

function init(_size) {
  size = _size;

  // init led array
  for (let i = 0; i < size * size; i += 1) {
    leds[i] = RGB(0, 0, 0);
  }
}

function on(event, cb) {
  scriptEvents.on(event, cb);
}

function feedback() {
  Remotes.feedback();
}

// ////////////////////////////////////////////////////////////////////////
// led functions
// ////////////////////////////////////////////////////////////////////////
function ledXY(_x, _y, rgb) {
  const x = Math.round(_x);
  const y = Math.round(_y);
  if (x > size - 1 || y > size - 1 || x < 0 || y < 0) {
    return;
  }
  ledID(y * size + x, rgb);
}

function ledID(id, rgb) {
  if (typeof rgb === 'undefined') {
    return;
  }
  if (!EQAULS_RGB(leds[id], rgb)) {
    leds[id] = rgb;
  }
}

function fill(rgb) {
  for (let i = 0; i < size * size; i += 1) {
    ledID(i, rgb);
  }
}

function clear() {
  fill(RGB(0, 0, 0));
}

function toArray() {
  return leds;
}

function toString() {
  const data = [];
  for (let i = 0; i < leds.length; i += 1) {
    data.push(RGB_TO_STRING(leds[i]));
  }
  return data.join('');
}

// EXPORTS
module.exports = {
  on,
  size,

  feedback,

  led: ledXY,
  ledXY,
  ledID,
  fill,
  clear,
  toArray,
  toString,
};
