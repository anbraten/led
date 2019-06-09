const socketIo = require('socket.io');
const Loop = require('./loop');
const Scripts = require('./scripts');


let io;
let connectedClients = 0;
const PASSWORD = process.env.PASSWORD || null;

function isAllowed(socket) {
  if (!socket.authenticated) {
    socket.emit('access', 'denied');
    return false;
  }

  return true;
}

function init(server) {
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
      Loop.start(script);
    });

    socket.on('stop', () => {
      if (!isAllowed(socket)) { return; }
      Loop.stop();
    });

    socket.on('restart', () => {
      if (!isAllowed(socket)) { return; }
      Loop.restart();
    });

    socket.on('pause', () => {
      if (!isAllowed(socket)) { return; }
      Loop.pause();
    });

    socket.on('resume', () => {
      if (!isAllowed(socket)) { return; }
      Loop.resume();
    });

    socket.on('scripts', () => {
      if (!isAllowed(socket)) { return; }
      Scripts.list((scripts) => {
        socket.emit(scripts);
      });
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
}

function broadcast(...args) {
  if (!io) { return; }

  io.to('authenticated').emit(...args);
}

module.exports = {
  init,
  broadcast,
};
