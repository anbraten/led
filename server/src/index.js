require('dotenv').config();
const matix = require('./matrix');
const socket = require('./socket');
const scripts = require('./scripts');
const log = require('./log');

const MATRIX_X = process.env.MATRIX_X || 10;
const MATRIX_Y = process.env.MATRIX_Y || 10;

(() => {
  matix.init({ x: MATRIX_X, y: MATRIX_Y });
  scripts.init();
  socket.init();

  log('Server started.');
})();
