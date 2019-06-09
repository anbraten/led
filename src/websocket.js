const WebSocket = require('ws');
const EventEmitter = require('events');

const emitter = new EventEmitter();
let wss;
const autoLogin = false;
const password = null;

function init(server) {
  wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    console.log('WebSocket: new connection');
    ws.authenticated = false;
    emitter.emit('newConnection', ws);

    ws.write = (data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
      }
    };

    if (autoLogin) {
      authConnection(ws, true);
    }

    ws.on('message', (msg) => {
      parse(ws, msg);
    });

    ws.on('close', () => {
      emitter.emit('closeConnection', ws);
      ws.terminate();
      console.log('WebSocket: connection closed');
    });

    ws.on('error', () => {
      ws.terminate();
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

/*  webSocket.on('newConnection', (ws) => {
    webSocket.write(ws, {
      type: 'status',
      status: Matrix.connected,
    });
    webSocket.write(ws, {
      type: 'script',
      script: script ? script.id : null,
    });
    if (script) {
      // TODO: send script info, inputs, ...
    } else {
      listScripts((files) => {
        webSocket.write(ws, {
          type: 'scripts',
          scripts: files,
        });
      });
    }
  });
  webSocket.on('authenticated', (ws, auth) => {
    if (auth && script) {
      const leds = Matrix.toArray();
      for (let i = 0; i < leds.length; i++) {
        webSocket.broadcast({
          type: 'led',
          id: i,
          rgb: leds[i],
        });
      }
    }
  });
  webSocket.on('data', (data, auth) => {
    if (auth) {
      switch (data.type) {
        case 'launch_script':
          launchScript(data.script);
          break;
        case 'stop_script':
          stopScript();
          break;
      }
    } else {
      // public commands
    }
  });
*/

  // WebSocket keep a live pings
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping(() => {});
      return null;
    });
  }, 30000);
}

function authConnection(ws, auth) {
  ws.authenticated = auth;
  ws.write(ws, {
    type: 'auth',
    auth: ws.authenticated,
  });
  emitter.emit('authenticated', ws, auth);
}

function parse(id, ws, msg) {
  let data;
  try {
    data = JSON.parse(msg);
  } catch (err) {
    emitter.emit('error', err);
    return;
  }

  if (ws.authenticated === true) {
    switch (data.type) {
      case 'logout':
        authConnection(ws, false);
        return;
      default:
        emitter.emit('data', data, true);
    }
  }

  switch (data.type) {
    case 'login':
      if (data.password === password || password === null) {
        authConnection(ws, true);
      } else {
        // TODO: auth failed
      }
      break;
    case 'authenticated':
      ws.write({
        type: 'authenticated',
        auth: ws.authenticated,
      });
      break;
    default:
      emitter.emit('data', data, false);
      break;
  }
}

// authConnection to true to only write to authenticated clients
function broadcast(data, authConnection) {
  wss.clients.forEach((ws) => {
    if (!authConnection || ws.authenticated === true) {
      ws.write(ws, data);
    }
  });
}

module.exports = {
  init,
  broadcast,
};
