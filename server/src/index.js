require('dotenv').config();
const matix = require('./matrix');
const socket = require('./socket');
const log = require('./log');

(() => {
  matix.init({ x: 10, y: 10 });
  socket.init({ matrix });

  log('Server started.');
})();
