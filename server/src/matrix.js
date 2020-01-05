const { RGB } = require('./utils');

let size = { x: 0, y: 0 };
let pixels;
let pixelBuffer;

function checkXYBounds(x, y) {
  if (x > size.x - 1 || y > size.y - 1 || x < 0 || y < 0) {
    throw new Error('x / y out of bounds');
  }

  return true;
}

function getPixelAt(position) {
  return pixels[position];
}

function getPixel(_x, _y) {
  const x = Math.round(_x);
  const y = Math.round(_y);

  checkXYBounds(x, y);

  return getPixelAt(y * size.y + x);
}

function setPixelAt(position, rgb) {
  if (typeof rgb === 'undefined') {
    return;
  }

  pixels[position] = rgb;
}

function setPixel(_x, _y, rgb) {
  const x = Math.round(_x);
  const y = Math.round(_y);

  checkXYBounds(x, y);

  setPixelAt(y * size.y + x, rgb);
}

function fill(rgb) {
  for (let i = 0; i < size.x * size.y; i += 1) {
    setPixelAt(i, rgb);
  }
}

function clear() {
  fill(RGB(0, 0, 0));
}

function init({ x, y }) {
  size = { x, y };
  pixels = [];
  clear();
}

function getSize() {
  return size;
}

function toString() {
  const data = [];

  pixels.forEach((rgb) => {
    data.push(rgb.toString());
  });

  return data.join('');
}

function draw(cb) {
  Object.entries(pixels).forEach((key, value) => {
    if (!pixelBuffer[key] || (value && value.equals(pixelBuffer[key]))) {
      const position = key;
      const rgb = value.toString();
      cb(position, rgb);
    }
  });

  pixelBuffer = pixels;
}


module.export = {
  init,
  getSize,
  setPixel,
  getPixel,
  clear,
  fill,
  draw,
  toString,
};
