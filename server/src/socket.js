const socketIo = require('socket.io');
const http = require('http');
const loop = require('./loop');
const log = require('./log');

const PORT = process.env.PORT || 8080;
const PASSWORD = process.env.PASSWORD || null;

const server = http.createServer();
// const server = require('http').createServer(app);
let io;
let connectedClients;

function broadcast(...args) {
  if (io) {
    io.emit(...args);
  }
}

function init() {
  io = socketIo(server, { path: '/api' });
  connectedClients = 0;

  io.sockets.on('connection', (socket) => {
    // auto login if no password is set
    let authenticated = !PASSWORD || false;

    connectedClients += 1;

    // socket emit complete matrix buffer

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
      const res = loop.start(script);
      if (!res) {
        socket.emit('error', 'failed loading script');
        return;
      }
      broadcast('script', script);
      broadcast('running', true);
    });

    socket.on('stop', () => {
      if (!authenticated) { return; }
      loop.stop();
      broadcast('script', null);
      broadcast('running', false);
    });

    socket.on('restart', () => {
      if (!authenticated) { return; }
      loop.restart();
    });

    socket.on('pause', () => {
      if (!authenticated) { return; }
      loop.pause();
      broadcast('running', false);
    });

    socket.on('resume', () => {
      if (!authenticated) { return; }
      loop.resume();
      broadcast('running', true);
    });

    socket.on('scripts', async () => {
      if (!authenticated) { return; }
      socket.emit('scripts', await loop.list());
    });

    socket.on('disconnect', () => {
      connectedClients -= 1;
    });
  });

  server.listen(PORT, () => {
    log(`Server listening on port ${PORT}!`);
  });
}

module.exports = {
  init,
  broadcast,
};
