const SerialPort = require('serialport')
const EventEmitter = require('events')

var emitter = new EventEmitter()
var serialPort

// EXPORTS
exports = module.exports = {
  'init': init,
  'write': write,
  'on': on
}

// //////////////////////////////////////////////////////
// Serial functions
// //////////////////////////////////////////////////////

function init (port) {
  serialPort = new SerialPort(port, {
    baudRate: 115200,
    autoOpen: false
  })

  serialPort.on('open', () => {
    serialPort.on('data', (data) => {
      if (data.toString() === 'ready') {
        emitter.emit('connected')
      } else {
        emitter.emit('data', data.toString())
      }
    })
  })

  serialPort.on('close', () => {
    emitter.emit('disconnected')
    connect() // try to reconnect
  })

  // open errors will be emitted as an error event
  serialPort.on('error', (err) => {
    if (err) {
      emitter.emit('error', err)
    }
  })

  connect()
}

function on (event, cb) {
  emitter.on(event, cb)
}

function write (data, cb) {
  serialPort.write(data, 'binary', cb)
}

function connect () {
  serialPort.open((err) => {
    if (err) {
      // reconnect on error
      setTimeout(connect, 1000)
    }
  })
}
