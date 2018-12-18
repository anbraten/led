const EventEmitter = require('events');
const Remotes = require('./remotes');

class MyEmitter extends EventEmitter {}
const systemEvents = new MyEmitter();
const scriptEvents = new MyEmitter();

const ACTIONS = Object.freeze({
  none: 0, start: 1, stop: 2, restart: 3, resume: 4, pause: 5,
});

let size = 0;
let action = ACTIONS.none;
const leds = [];
const buffer = [];
let running;
let tick = 500;
const renderSpeed = 100;

function init(_size) {
  size = _size;
  exports.size = size;

  for (let i = 0; i < size * size; i += 1) {
    leds[i] = RGB(0, 0, 0);
  }
  loop();
  renderLoop();
  scriptEvents.emit('loaded');

  // Remotes.init();
  Remotes.on('button', (id, btns) => {
    if (btns.plus && btns.minus) {
      restart();
    }
    if (btns.btn1) {
      pause();
    }
    if (btns.btn2) {
      resume();
    }
    if (btns.minus) {
      setTick(tick + 100);
    }
    if (btns.plus) {
      setTick(tick - 100);
    }
    scriptEvents.emit('input', id, btns);
  });
}

// ////////////////////////////////////////////////////////////////////////
// system
// ////////////////////////////////////////////////////////////////////////
function start() {
  action = ACTIONS.start;
}

function stop() {
  action = ACTIONS.stop;
}

function restart() {
  action = ACTIONS.restart;
}

function resume() {
  action = ACTIONS.resume;
}

function pause() {
  action = ACTIONS.pause;
}

function loop() {
  switch (action) {
    case ACTIONS.start:
      clear();
      running = true;
      scriptEvents.emit('started');
      break;
    case ACTIONS.stop:
      running = false;
      scriptEvents.emit('stopped');
      scriptEvents.removeAllListeners();
      clear();
      break;
    case ACTIONS.restart:
      running = false;
      scriptEvents.emit('stopped');
      clear();
      running = true;
      scriptEvents.emit('started');
      break;
    case ACTIONS.resume:
      if (!running) {
        running = true;
        scriptEvents.emit('resumed');
      }
      break;
    case ACTIONS.pause:
      if (running) {
        running = false;
        scriptEvents.emit('paused');
      }
      break;
    default:
      break;
  }
  action = ACTIONS.none;

  if (running) {
    scriptEvents.emit('update');
    setTimeout(loop, tick);
  } else {
    setTimeout(loop, 10);
  }
}

function renderLoop() {
  scriptEvents.emit('draw');
  for (let i = 0; i < size * size; i += 1) {
    if (!(i in buffer) || !EQAULS_RGB(leds[i], buffer[i])) {
      systemEvents.emit('broadcastLed', i, leds[i]);
      buffer[i] = leds[i];
    }
  }
  systemEvents.emit('showLeds');
  setTimeout(renderLoop, renderSpeed);
}

function onSystem(event, cb) {
  systemEvents.on(event, cb);
}

function on(event, cb) {
  scriptEvents.on(event, cb);
}

function setTick(_tick) {
  if (_tick >= 10) {
    tick = _tick;
  }
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

// ////////////////////////////////////////////////////////////////////////
// Objects
// ////////////////////////////////////////////////////////////////////////
function Drops(chance, multiple, color) {
  this.chance = chance;
  this.multiple = multiple;
  this.color = color;
  this.drops = [];

  this.update = () => {
    // del old drops from screen
    for (let i = 0; i < this.drops.length; i += 1) {
      const { x, y } = this.drops[i];
      ledXY(x, y, RGB(0, 0, 0));
    }

    // del landed drops
    for (let i = 0; i < this.drops.length; i += 1) {
      if (this.drops[i].y === 9) {
        this.drops.splice(i, 1);
      }
    }

    // move drops
    for (let i = 0; i < this.drops.length; i += 1) {
      this.drops[i].y = this.drops[i].y + 1;
    }

    // add new drops
    if (RND(0, 100) < this.chance) {
      for (let i = 0; i < RND(1, this.multiple); i += 1) {
        this.drops.push(new Rect('drop', this.color, RND(0, 10), 0, 1, 1));
      }
    }
  };

  this.draw = () => {
    for (let i = 0; i < this.drops.length; i += 1) {
      this.drops[i].draw();
    }
  };
}

function Rect(name, color, x, y, width, height) {
  this.name = name;
  this.color = color;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.draw = () => {
    // Draw playing object
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        ledXY(this.x + i, this.y + j, this.color);
      }
    }
  };
}

// static helper
function RGB(r, g, b) {
  return {
    r,
    g,
    b,
  };
}

function EQAULS_RGB(one, two) {
  return (one.r === two.r && one.g === two.g && one.b === two.b);
}

function RGB_TO_STRING(rgb) {
  let str = '';
  str += `${(rgb.r < 100) ? ((rgb.r >= 10) ? (`0${rgb.r}`) : (`00${rgb.r}`)) : rgb.r}`;
  str += `:${(rgb.g < 100) ? ((rgb.g >= 10) ? (`0${rgb.g}`) : (`00${rgb.g}`)) : rgb.g}`;
  str += `:${(rgb.b < 100) ? ((rgb.b >= 10) ? (`0${rgb.b}`) : (`00${rgb.b}`)) : rgb.b}`;
  return str;
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSV_TO_RGB(...args) {
  let h;
  let s;
  let v;
  let r;
  let g;
  let b;

  if (args.length === 1) {
    [{ h, s, v }] = args;
  } else {
    [h, s, v] = args;
  }

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function RND(min, max) {
  return Math.floor((Math.random() * max) + min);
}

function RND_COLOR() {
  return RGB(RND(0, 255), RND(0, 255), RND(0, 255));
}

// EXPORTS
module.exports = {
  init,
  start,
  stop,
  restart,
  resume,
  pause,
  on,
  onSystem,
  size,
  setTick,

  feedback,

  led: ledXY,
  ledXY,
  ledID,
  fill,
  clear,
  toArray,
  toString,

  Drops,
  Rect,

  RGB,
  EQAULS_RGB,
  RGB_TO_STRING,
  HSV_TO_RGB,
  RND,
  RND_COLOR,
};
