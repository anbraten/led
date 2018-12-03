const WebSocket = require('ws')
const EventEmitter = require('events')

var emitter = new EventEmitter()
var clients = []
var connectedClients = 0
var wss
var autoLogin = false
var password = null

// EXPORTS
exports = module.exports = {
  'init': init,
  'write': write,
  'broadcast': broadcast,
  'on': on
}

function init (port, _autoLogin, _password) {
  autoLogin = _autoLogin
  password = _password

  wss = new WebSocket.Server({ port: port })
  wss.on('connection', (ws) => {
    let id = connectedClients
    initConnection(id, ws)

    ws.on('message', (msg) => {
      parse(id, ws, msg)
    })
    ws.on('close', (code, reason) => {
      closeConnection(id, ws)
    })
    ws.on('error', (e) => {
      ws.terminate()
    })
    ws.on('pong', () => {
      ws.isAlive = true
    })
  })

  // WebSocket keep a live pings
  setInterval(() => {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) return ws.terminate()
      ws.isAlive = false
      ws.ping(() => {})
    })
  }, 30000)

  console.log('Websocket: port ' + port)
}

function on (event, cb) {
  emitter.on(event, cb)
}

function initConnection (id, ws) {
  console.log('WebSocket: new connection')
  clients[id] = ws
  ws.authenticated = false
  connectedClients++

  emitter.emit('newConnection', ws)

  if (autoLogin) {
    authConnection(ws, true)
  }
}

function closeConnection (id, ws) {
  emitter.emit('closeConnection', id)
  ws.terminate()
  delete clients[id]
  connectedClients--
  console.log('WebSocket: connection closed')
}

function authConnection (ws, auth) {
  ws.authenticated = auth
  write(ws, {
    'type': 'auth',
    'auth': ws.authenticated
  })
  emitter.emit('authenticated', ws, auth)
}

function parse (id, ws, msg) {
  let data
  try {
    data = JSON.parse(msg)
  } catch (err) {
    emitter.emit('error', err)
    return
  }

  if (ws.authenticated === true) {
    switch (data.type) {
      case 'logout':
        authConnection(ws, false)
        return
      default:
        emitter.emit('data', data, true)
    }
  }

  switch (data.type) {
    case 'login':
      if (data.password === password || password === null) {
        authConnection(ws, true)
      } else {
        // TODO: auth failed
      }
      break
    case 'authenticated':
      write(ws, {
        'type': 'authenticated',
        'auth': ws.authenticated
      })
      break
    default:
      emitter.emit('data', data, false)
      break
  }
}

function write (ws, data) {
  if (ws.readyState === ws.OPEN) {
    var raw = JSON.stringify(data)
    ws.send(raw)
  }
}

// authConnection to true to only write to authenticated clients
function broadcast (data, authConnection) {
  wss.clients.forEach(function each (ws) {
    if (!authConnection || ws.authenticated === true) {
      write(ws, data)
    }
  })
}
