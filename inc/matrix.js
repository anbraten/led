'use strict'

const ACTIONS = Object.freeze({'none': 0, 'start': 1, 'stop': 2, 'resume': 3, 'pause': 4})

const EventEmitter = require('events')
class MyEmitter extends EventEmitter {}
const systemEvents = new MyEmitter()
const scriptEvents = new MyEmitter()

var size = 0

var action = ACTIONS.none
var leds = []
var buffer = []
var running
var tick = 500
var renderSpeed = 100

// EXPORTS
exports = module.exports = {
  'init': init,
  'start': start,
  'stop': stop,
  'resume': resume,
  'pause': pause,
  'on': on,
  'onSystem': onSystem,
  'size': size,
  'setTick': setTick,

  'led': ledXY,
  'ledXY': ledXY,
  'ledID': ledID,
  'fill': fill,
  'clear': clear,
  'toArray': toArray,
  'toString': toString,

  'Drops': Drops,
  'Rect': Rect,

  'RGB': RGB,
  'EQAULS_RGB': EQAULS_RGB,
  'RGB_TO_STRING': RGB_TO_STRING,
  'HSV_TO_RGB': HSV_TO_RGB,
  'RND': RND,
  'RND_COLOR': RND_COLOR
}

function init (_size) {
  size = _size
  exports.size = size

  for (let i = 0; i < size * size; i++) {
    leds[i] = RGB(0, 0, 0)
  }
  loop()
  renderLoop()
  scriptEvents.emit('loaded')
}

// ////////////////////////////////////////////////////////////////////////
// system
// ////////////////////////////////////////////////////////////////////////
function start () {
  action = ACTIONS.start
}

function stop () {
  action = ACTIONS.stop
}

function resume () {
  action = ACTIONS.stop
}

function pause () {
  action = ACTIONS.pause
}

function loop () {
  switch (action) {
    case ACTIONS.start:
      clear()
      running = true
      scriptEvents.emit('started')
      break
    case ACTIONS.stop:
      running = false
      scriptEvents.emit('stopped')
      scriptEvents.removeAllListeners()
      break
    case ACTIONS.resume:
      if (!running) {
        running = true
        scriptEvents.emit('resumed')
      }
      break
    case ACTIONS.pause:
      if (running) {
        running = false
        scriptEvents.emit('paused')
      }
      break
    default:
      break
  }
  action = ACTIONS.none

  if (running) {
    scriptEvents.emit('update')
    setTimeout(loop, tick)
  } else {
    setTimeout(loop, 10)
  }
}

function renderLoop () {
  if (running) {
    scriptEvents.emit('draw')
    for (let i = 0; i < size * size; i++) {
      if (!(i in buffer) || !EQAULS_RGB(leds[i], buffer[i])) {
        systemEvents.emit('broadcastLed', i, leds[i])
        buffer[i] = leds[i]
      }
    }
    systemEvents.emit('showLeds')
    setTimeout(renderLoop, renderSpeed)
  } else {
    setTimeout(renderLoop, 10)
  }
}

function onSystem (event, cb) {
  systemEvents.on(event, cb)
}

function on (event, cb) {
  scriptEvents.on(event, cb)
}

function setTick (_tick) {
  if (_tick >= 10) {
    tick = _tick
  }
}

// ////////////////////////////////////////////////////////////////////////
// led functions
// ////////////////////////////////////////////////////////////////////////
function ledXY (x, y, rgb) {
  x = Math.round(x)
  y = Math.round(y)
  if (x > size - 1 || y > size - 1 || x < 0 || y < 0) {
    return
  }
  ledID(y * size + x, rgb)
}

function ledID (id, rgb) {
  if (typeof rgb === 'undefined') {
    return
  }
  if (!EQAULS_RGB(leds[id], rgb)) {
    leds[id] = rgb
  }
}

function fill (rgb) {
  for (let i = 0; i < size * size; i++) {
    ledID(i, rgb)
  }
}

function clear () {
  fill(RGB(0, 0, 0))
}

function toArray () {
  return leds
}

function toString () {
  var data = []
  for (var i = 0; i < leds.length; i++) {
    data.push(RGB_TO_STRING(leds[i]))
  }
  return data.join('')
}

// ////////////////////////////////////////////////////////////////////////
// Objects
// ////////////////////////////////////////////////////////////////////////
function Drops (chance, multiple, color) {
  this.chance = chance
  this.multiple = multiple
  this.color = color
  this.drops = []

  this.update = function () {
    // del old drops from screen
    for (var i = 0; i < this.drops.length; i++) {
      let x = this.drops[i].x
      let y = this.drops[i].y
      ledXY(x, y, RGB(0, 0, 0))
    }

    // del landed drops
    for (let i = 0; i < this.drops.length; i++) {
      if (this.drops[i].y === 9) {
        this.drops.splice(i, 1)
      }
    }

    // move drops
    for (let i = 0; i < this.drops.length; i++) {
      this.drops[i].y = this.drops[i].y + 1
    }

    // add new drops
    if (RND(0, 100) < this.chance) {
      for (let i = 0; i < RND(1, this.multiple); i++) {
        this.drops.push(new Rect('drop', this.color, RND(0, 10), 0, 1, 1))
      }
    }
  }

  this.draw = function () {
    for (var i = 0; i < this.drops.length; i++) {
      this.drops[i].draw()
    }
  }
}

function Rect (name, color, x, y, width, height) {
  this.name = name
  this.color = color
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.draw = function () {
    // Draw playing object
    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {
        ledXY(this.x + i, this.y + j, this.color)
      }
    }
  }
}

// static helper
function RGB (r, g, b) {
  return {
    'r': r,
    'g': g,
    'b': b
  }
}

function EQAULS_RGB (one, two) {
  return (one.r === two.r && one.g === two.g && one.b === two.b)
}

function RGB_TO_STRING (rgb) {
  let str = ''
  str += '' + ((rgb.r < 100) ? ((rgb.r >= 10) ? ('0' + rgb.r) : ('00' + rgb.r)) : rgb.r)
  str += ':' + ((rgb.g < 100) ? ((rgb.g >= 10) ? ('0' + rgb.g) : ('00' + rgb.g)) : rgb.g)
  str += ':' + ((rgb.b < 100) ? ((rgb.b >= 10) ? ('0' + rgb.b) : ('00' + rgb.b)) : rgb.b)
  return str
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function HSV_TO_RGB (h, s, v) {
  let r, g, b, i, f, p, q, t
  if (arguments.length === 1) {
    s = h.s
    v = h.v
    h = h.h
  }
  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function RND (min, max) {
  return Math.floor((Math.random() * max) + min)
}

function RND_COLOR () {
  return RGB(RND(0, 255), RND(0, 255), RND(0, 255))
}
