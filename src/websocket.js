const socketIo = require('socket.io');

let io;
let connectedClients = 0;
const PASSWORD = process.env.PASSWORD || null;

function init(server) {
  io = socketIo(server, { path: '/api' });

  io.sockets.on('connection', (socket) => {
    let authenticated = process.env.AUTLOGIN || false;
    connectedClients += 1;

    socket.on('info', () => {
      socket.emit('info', {
        connectedClients,
      });
    });

    socket.on('login', (password) => {
      if (password === PASSWORD || PASSWORD === null) {
        authenticated = true;
        socket.emit('login', 'successfull');
      } else {
        socket.emit('login', 'failed');
      }
    });

    socket.on('logout', () => {
      authenticated = false;
      socket.emit('logout', 'successfull');
    });

    socket.on('disconnect', () => {
      connectedClients -= 1;
    });
  });
}

// authConnection to true to only write to authenticated clients
function broadcast() {
}

module.exports = {
  init,
  broadcast,
};
