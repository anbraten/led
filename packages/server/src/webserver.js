const express = require('express');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = require('http').createServer(app);

const PORT = process.env.PORT || 8080;
const PASSWORD = process.env.PASSWORD || null;

let io;
let bus;
let connectedClients = 0;

function isAllowed(socket) {
  if (!socket.authenticated) {
    socket.emit('error', 'denied');
    return false;
  }

  return true;
}

function initSocket() {
  io = socketIo(server, { path: '/api' });

  io.sockets.on('connection', (socket) => {
    // auto login if no password is set
    socket.authenticated = !PASSWORD || false;
    connectedClients += 1;

    socket.on('info', () => {
      socket.emit('info', {
        connectedClients,
      });
    });

    socket.on('login', (password) => {
      if (password === PASSWORD || PASSWORD === null) {
        socket.authenticated = true;
        socket.join('authenticated');
        socket.emit('login', 'successfull');
      } else {
        socket.emit('login', 'failed');
      }
    });

    socket.on('start', (script) => {
      if (!isAllowed(socket)) { return; }
      bus.emit('start', script);
    });

    socket.on('stop', () => {
      if (!isAllowed(socket)) { return; }
      bus.emit('stop');
    });

    socket.on('restart', () => {
      if (!isAllowed(socket)) { return; }
      bus.emit('restart');
    });

    socket.on('pause', () => {
      if (!isAllowed(socket)) { return; }
      bus.emit('pause');
    });

    socket.on('resume', () => {
      if (!isAllowed(socket)) { return; }
      bus.emit('resume');
    });

    socket.on('scripts', () => {
      if (!isAllowed(socket)) { return; }
      bus.once('scripts', (scripts) => {
        socket.emit('scripts', scripts);
      });
      bus.emit('scripts:get');
    });

    socket.on('logout', () => {
      socket.authenticated = false;
      socket.leave('authenticated');
      socket.emit('logout', 'successfull');
    });

    socket.on('disconnect', () => {
      connectedClients -= 1;
    });
  });

  bus.on('broadcast', (...args) => {
    io.to('authenticated').emit(...args);
  });
}

function init(_bus) {
  bus = _bus;

  // Express (static app files)
  app.use(express.static(path.join(__dirname, '..', 'spa', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'spa', 'index.html'));
  });

  app.on('error', (err) => {
    bus.emit('log', 'server error', err);
  });

  initSocket();

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`);
  });
}

module.exports = {
  init,
};
