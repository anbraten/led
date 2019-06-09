const events = require('events');
const Matrix = require('./matrix');
const Scripts = require('./scripts');
const Remotes = require('./remotes');
const Colors = require('./utils/colors');
const GObjects = require('./utils/gobjects');

// Create an eventEmitter object
const bus = new events.EventEmitter();
const scriptBus = new events.EventEmitter();

const renderSpeed = 100;
let running = false;
let tick = 500;

function stop() {
  running = false;
  bus.emit('stop');
  bus.removeAllListeners();
  Matrix.clear();
}

function start(name) {
  if (running) {
    stop();
  }

  Matrix.clear();
  running = true;
  const script = Scripts.load(name);
  script.init({
    ...Colors,
    ...GObjects,
    led: Matrix.led,
    ledXY: Matrix.led,
    fill: Matrix.fill,
    clear: Matrix.clear,
    size: Matrix.size,
    setTick,
    on: scriptBus.on,
  });
  WebSocket.broadcast('script', script.id);
  bus.emit('started');
}

function restart() {
  stop();
  start();
}

function resume() {
  if (!running) {
    running = true;
    bus.emit('resumed');
  }
}

function pause() {
  if (running) {
    running = false;
    bus.emit('paused');
  }
}

function setTick(_tick) {
  if (_tick >= 10) {
    tick = _tick;
  }
}

function loop() {
  if (running) {
    bus.emit('update');
    setTimeout(loop, tick);
  } else {
    setTimeout(loop, 10);
  }
}

function renderLoop() {
  bus.emit('draw');
  Matrix.draw();
  setTimeout(renderLoop, renderSpeed);
}

function init() {
  // events which are allowed to be forwarded to unsafe scripts
  const scriptEvents = ['started', 'stopped', 'resumed', 'paused', 'update', 'draw', 'input'];
  scriptEvents.forEach((event) => {
    bus.on(event, (...args) => {
      scriptBus.emit(event, ...args);
    });
  });

  // TODO: set variable matrix size
  Matrix.init(10);

  // TODO: set matrix url
  Matrix.connect('');

  // Remotes.init();
  Remotes.on('button', (id, btns) => {
    if (btns.plus && btns.minus) {
      restart();
    }
    if (btns.btn1) {
      pause();
    }
    if (btns.btn2) {
      resume();
    }
    if (btns.minus) {
      setTick(tick + 100);
    }
    if (btns.plus) {
      setTick(tick - 100);
    }

    bus.emit('input', id, btns);
  });

  // Start loops
  loop();
  renderLoop();

  // Autostart script
  const autoStart = process.env.SCRIPT_AUTOSTART || null;

  if (autoStart) {
    Scripts.launch(autoStart);
  }
}

/*
function broadCastLed() {
  webSocket.broadcast({
    type: 'led',
    id,
    rgb,
  }, true);

  if (Matrix.connected) {
    let x = Math.floor(id / Matrix.size);
    const y = id % Matrix.size;
    if (y % 2 === 0) {
      x = Matrix.size - x - 1;
    }
    id = (y * Matrix.size + x);
    const data = [];
    data.push(1);
    data.push(id);
    data.push(rgb.r);
    data.push(rgb.g);
    data.push(rgb.b);
    serial.write(data, (err) => {
      if (err) {
        log(`Serial Error: ${err.message}`);
      }
    });
  }
}
*/

module.exports = {
  init,
  start,
  stop,
  restart,
  pause,
  resume,
};
