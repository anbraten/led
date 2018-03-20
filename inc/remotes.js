var wii = require('wiimote')
var wii2 = require('wiimote2')

const EventEmitter = require('events')
class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter()

const BUTTON_1 = 2
const BUTTON_2 = 1
const BUTTON_A = 8
const BUTTON_B = 4
const BUTTON_PLUS = 4096
const BUTTON_MINUS = 16
const BUTTON_LEFT = 256
const BUTTON_RIGHT = 512
const BUTTON_UP = 2048
const BUTTON_DOWN = 1024
const BUTTON_HOME = 128

var wiimotes = []
var connectedRemotes = 0

// EXPORTS
exports = module.exports = {
  'init': init,
  'connect': connect,
  'feedback': feedback,
  'on': on
}

// //////////////////////////////////////////////////////
// Remote functions
// //////////////////////////////////////////////////////

function init () {
  // connect('00:22:D7:D9:36:D7')
  // connect('00:22:D7:94:69:CB')
}

function feedback () {
  for (var i = 0; i < wiimotes.length; i++) {
    wiimotes[i].rumble(true)
  }
  setTimeout(() => {
    for (var i = 0; i < wiimotes.length; i++) {
      wiimotes[i].rumble(false)
    }
  }, 100)
}

function connect (mac) {
  var wiimote = (mac === '00:22:D7:D9:36:D7') ? new wii.WiiMote() : new wii2.WiiMote()
  wiimote.mac = mac
  wiimote.connect(mac, (err) => {
    if (err) {
      console.log('error:', err)
      setTimeout(() => {
        connect(mac)
      }, 1000)
      return
    }

    var id = connectedRemotes
    connectedRemotes++
    for (var i = 1; i <= connectedRemotes; i++) {
      wiimote.led(i, true)
    }
    console.log('Wiimote[' + mac + ']: connected', id)
    wiimotes.push(wiimote)

    wiimote.on('disconnect', () => {
      console.log('Wiimote[' + mac + ']: disconnected')
      connectedRemotes--
      setTimeout(() => {
        connect(mac)
      }, 1000)
    })

    wiimote.on('status', (status) => {
      console.log('Wiimote[' + mac + ']:', status)
      emitter.emit('status', id, status)
    })

    wiimote.ir(true)
    wiimote.on('ir', (points) => {
      for (var p in points) {
        console.log('Wiimote[' + mac + '] Point:', p['x'], p['y'], p['size'])
      }
      emitter.emit('ir', id, points)
    })

    wiimote.button(true)
    wiimote.on('button', (btn, err) => {
      if (err) {
        console.log('Wiimote[' + mac + '] Button error:', err)
        return
      }

      var btns = {
        'btn1': (btn & BUTTON_1) === BUTTON_1,
        'btn2': (btn & BUTTON_2) === BUTTON_2,
        'a': (btn & BUTTON_A) === BUTTON_A,
        'b': (btn & BUTTON_B) === BUTTON_B,
        'plus': (btn & BUTTON_PLUS) === BUTTON_PLUS,
        'minus': (btn & BUTTON_MINUS) === BUTTON_MINUS,
        'up': (btn & BUTTON_UP) === BUTTON_UP,
        'left': (btn & BUTTON_LEFT) === BUTTON_LEFT,
        'down': (btn & BUTTON_DOWN) === BUTTON_DOWN,
        'right': (btn & BUTTON_RIGHT) === BUTTON_RIGHT,
        'home': (btn & BUTTON_HOME) === BUTTON_HOME
      }

      emitter.emit('button', id, btns)
    })

    wiimote.on('accelerometer', (data, err) => {
      if (err) {
        console.log('Wiimote[' + mac + '] Accelerometer error:', err)
        return
      }
      console.log('Wiimote[' + mac + '] Accelerometer:', data)
      emitter.emit('accelerometer', id, data)
    })
  })
}

function on (name, cb) {
  emitter.on(name, cb)
}
