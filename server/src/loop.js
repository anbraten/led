const matrix = require('./matrix');

const RENDER_SPEED = 1000; // 1000 ms
let isRunning = false;

function start(script) {

}

function stop(script) {

}

function pause() {

}

function resume() {

}

(() => {
  setInterval(() => {
    // TODO: draw matrix
    matrix.draw((position, color) => {
      client.emit('pixel', { position, color });
    });
  }, RENDER_SPEED);
})();

module.exports = {
  start,
  stop,
  pause,
  resume,
};
