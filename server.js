#!/usr/bin/env node

'use strict'

// //////////////////////////////////////////////////////
// constant
// //////////////////////////////////////////////////////
const express = require('express')
const web = express()
const fs = require('fs')
const path = require('path')
const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const config = require('./config')[nodeEnv]

const Matrix = require('./inc/matrix')
const serial = require('./inc/serial')
const webSocket = require('./inc/websocket')

var script

init()

// //////////////////////////////////////////////////////
// core functions
// //////////////////////////////////////////////////////
function init () {
  // SERIAL
  if (config.matrix.serialPort) {
    serial.init(config.matrix.serialPort)
    serial.on('connected', () => {
      // TODO: send all current led states
      log('Serial: connected')
      Matrix.connected = true
      webSocket.broadcast({
        'type': 'status',
        'status': Matrix.connected
      })
    })
    serial.on('disconnected', () => {
      log('Serial: closed')
      Matrix.connected = false
      webSocket.broadcast({
        'type': 'status',
        'status': Matrix.connected
      })
    })
  }

  // WebSocket
  webSocket.init(
    config.web.websocket.port,
    config.auth.autoLogin,
    config.auth.password
  )
  webSocket.on('newConnection', (ws) => {
    webSocket.write(ws, {
      'type': 'status',
      'status': Matrix.connected
    })
    webSocket.write(ws, {
      'type': 'script',
      'script': script ? script.id : null
    })
    if (script) {
      // TODO: send script info, inputs, ...
    } else {
      listScripts((files) => {
        webSocket.write(ws, {
          'type': 'scripts',
          'scripts': files
        })
      })
    }
  })
  webSocket.on('authenticated', (ws, auth) => {
    if (auth && script) {
      let leds = Matrix.toArray()
      for (let i = 0; i < leds.length; i++) {
        webSocket.broadcast({
          'type': 'led',
          'id': i,
          'rgb': leds[i]
        })
      }
    }
  })
  webSocket.on('data', (data, auth) => {
    if (auth) {
      switch (data.type) {
        case 'launch_script':
          launchScript(data.script)
          break
        case 'stop_script':
          stopScript()
          break
      }
    } else {
      // public commands
    }
  })

  // Express (static web files)
  web.use(express.static(path.join(__dirname, config.web.root)))
  web.get('/load.js', function (req, res) {
    res.set('Content-Type', 'text/javascript')
    res.send('socket = connectWebsocket("' +
      config.web.websocket.address + '")'
    )
  })
  web.listen(config.web.port)

  // Matrix
  Matrix.init(config.matrix.size)
  Matrix.onSystem('broadcastLed', (id, rgb) => {
    webSocket.broadcast({
      'type': 'led',
      'id': id,
      'rgb': rgb
    }, true)

    if (Matrix.connected) {
      let x = Math.floor(id / Matrix.size)
      let y = id % Matrix.size
      if (y % 2 === 0) {
        x = Matrix.size - x - 1
      }
      id = (y * Matrix.size + x)
      var data = []
      data.push(1)
      data.push(id)
      data.push(rgb.r)
      data.push(rgb.g)
      data.push(rgb.b)
      serial.write(data, (err) => {
        if (err) {
          log('Serial Error: ' + err.message)
        }
      })
    }
  })

  Matrix.onSystem('showLeds', () => {
    if (Matrix.connected) {
      serial.write([2], (err) => {
        if (err) {
          log('Serial Error: ' + err.message)
        }
      })
    }
  })

  console.log('LED Server 0.3 (' + nodeEnv + ')')
  console.log('Webinterface: port ' + config.web.port)

  if (config.scripts.autoStart) {
    launchScript(config.scripts.autoStart)
  }
}

// //////////////////////////////////////////////////////
// Script functions
// //////////////////////////////////////////////////////
function listScripts (cb) {
  let dir = path.join(__dirname, config.scripts.path)
  fs.readdir(dir, function (e, files) {
    if (e) {
      log(e)
    }
    // only list .js files
    files = files.filter(item => (/(.*).js$/g).test(item))
    // TODO: return nice script names without file extension etc.
    cb(files)
  })
}

function launchScript (scriptName) {
  if (script) {
    stopScript()
  }
  try {
    script = require(path.join(__dirname, config.scripts.path, scriptName))
    script.id = scriptName
    script.init(Matrix)
    Matrix.start()
    webSocket.broadcast({
      'type': 'script',
      'script': script.id
    })
  } catch (e) {
    log(e)
  }
}

function stopScript () {
  if (script) {
    let id = script.id
    Matrix.stop()
    script = null
    delete require.cache[path.join(__dirname, config.scripts.path, id)]
    webSocket.broadcast({
      'type': 'script',
      'script': null
    })
    listScripts((files) => {
      webSocket.broadcast({
        'type': 'scripts',
        'scripts': files
      })
    })
  }
}

// //////////////////////////////////////////////////////
// Helper functions
// //////////////////////////////////////////////////////
function log (msg) {
  console.log(msg)
  webSocket.broadcast({
    'type': 'log',
    'log': msg
  })
}
