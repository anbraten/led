const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');
const log = require('./log');
const matrix = require('./matrix');
const socket = require('./socket');
const utils = require('./utils');

const scriptEmitter = new EventEmitter();
let script;
let tick;
let running = false;

const RENDER_SPEED = process.env.render_speed || 30;
const AUTOSTART = process.env.AUTOSTART || null;

function list(cb) {
  const dir = path.join(__dirname, '..', 'plugins');
  fs.readdir(dir, (e, files) => {
    if (e) {
      log(e);
    }

    // only list .js files
    cb(files.filter(item => (/(.*).js$/g).test(item)));
  });
}

function unload() {
  if (script) {
    const { id } = script;
    script = null;
    delete require.cache[path.join(__dirname, '..', 'plugins', id)];
  }
}

function load(pluginName) {
  if (script) {
    unload();
  }

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    script = require(path.join(__dirname, '..', 'plugins', pluginName));
    script.id = pluginName;
    return script;
  } catch (e) {
    log(e);
  }

  return null;
}

function setTick(_tick) {
  if (_tick >= 10) {
    tick = _tick;
  }
}

function stop() {
  running = false;
  matrix.clear();
  scriptEmitter.emit('stopped');
}

function start(scriptName) {
  if (running) {
    stop();
  }

  matrix.clear();
  running = true;
  const s = load(scriptName);
  if (!s) {
    // loading failed
    return false;
  }

  s.init({
    // TODO: add functions
    on: scriptEmitter.on,
    matrix: {
      getSize: matrix.getSize,
      setPixel: matrix.setPixel,
      getPixel: matrix.getPixel,
      clear: matrix.clear,
      fill: matrix.fill,
    },
    utils,
  });

  scriptEmitter.emit('started');

  return s;
}

function restart() {
  stop();
  start();
}

function resume() {
  if (!running) {
    running = true;
    scriptEmitter.emit('resumed');
  }
}

function pause() {
  if (running) {
    running = false;
    scriptEmitter.emit('paused');
  }
}

function loop() {
  if (running) {
    scriptEmitter.emit('update');
    setTimeout(loop, tick);
  } else {
    setTimeout(loop, 10);
  }
}

function init() {
  loop();

  setInterval(() => {
    if (script) {
      matrix.draw((position, color) => {
        socket.broadcast('pixel', { position, color });
      });
    }
  }, RENDER_SPEED);

  // Autostart plugin
  if (AUTOSTART) {
    start(AUTOSTART);
  }
}

module.exports = {
  init,
  list,
  load,
  unload,
  start,
  stop,
  restart,
  pause,
  resume,
  setTick,
};
