const socketIo = require('socket.io');
const http = require('http');
const scripts = require('./scripts');
const log = require('./log');

const PORT = process.env.PORT || 8080;
const PASSWORD = process.env.PASSWORD || null;

const server = http.createServer();
// const server = require('http').createServer(app);
let io;
let connectedClients;

function init() {
  io = socketIo(server, { path: '/api' });
  connectedClients = 0;

  io.sockets.on('connection', (socket) => {
    // auto login if no password is set
    let authenticated = !PASSWORD || false;

    connectedClients += 1;

    socket.on('status', () => {
      const status = {
        connectedClients,
      };
      socket.emit('status', status);
    });

    socket.on('login', (password) => {
      if (password === PASSWORD || PASSWORD === null) {
        authenticated = true;
        socket.join('authenticated');
        socket.emit('login', 'successfull');
      } else {
        socket.emit('login', 'failed');
      }
    });

    socket.on('logout', () => {
      authenticated = false;
      socket.leave('authenticated');
      socket.emit('logout', 'successfull');
    });

    socket.on('start', (script) => {
      if (!authenticated) { return; }
      scripts.start(script);
      io.emit('plugin', script);
    });

    socket.on('stop', () => {
      if (!authenticated) { return; }
      scripts.stop();
    });

    socket.on('restart', () => {
      if (!authenticated) { return; }
      scripts.restart();
    });

    socket.on('pause', () => {
      if (!authenticated) { return; }
      scripts.pause();
    });

    socket.on('resume', () => {
      if (!authenticated) { return; }
      scripts.resume();
    });

    socket.on('scripts', async () => {
      if (!authenticated) { return; }
      socket.emit('scripts', await scripts.list());
    });

    socket.on('disconnect', () => {
      connectedClients -= 1;
    });
  });

  server.listen(PORT, () => {
    log(`Server listening on port ${PORT}!`);
  });
}

function broadcast(...args) {
  if (io) {
    io.emit(...args);
  }
}

module.exports = {
  init,
  broadcast,
};
