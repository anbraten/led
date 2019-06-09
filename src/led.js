const Matrix = require('./Matrix');
const Remotes = require('./Remotes');

let tick = 500;
const renderSpeed = 100;
let running;

function start() {
  clear();
  running = true;
  scriptEvents.emit('started');
}

function stop() {
  running = false;
  scriptEvents.emit('stopped');
  scriptEvents.removeAllListeners();
  clear();
}

function restart() {
  running = false;
  scriptEvents.emit('stopped');
  clear();
  running = true;
  scriptEvents.emit('started');
}

function resume() {
  if (!running) {
    running = true;
    scriptEvents.emit('resumed');
  }
}

function pause() {
  if (running) {
    running = false;
    scriptEvents.emit('paused');
  }
}

function setTick(_tick) {
  if (_tick >= 10) {
    tick = _tick;
  }
}

function loop() {
  if (running) {
    scriptEvents.emit('update');
    setTimeout(loop, tick);
  } else {
    setTimeout(loop, 10);
  }
}

function renderLoop() {
  scriptEvents.emit('draw');
  for (let i = 0; i < size * size; i += 1) {
    if (!(i in buffer) || !EQAULS_RGB(leds[i], buffer[i])) {
      systemEvents.emit('broadcastLed', i, leds[i]);
      buffer[i] = leds[i];
    }
  }
  systemEvents.emit('showLeds');
  setTimeout(renderLoop, renderSpeed);
}

function connect() {
  // tcp connect
  const net = require('net');
  const host = process.NODE_ENV.LEDWALL_HOST;
  const port = process.NODE_ENV.LEDWALL_PORT;

  let client = new net.Socket();
  client.connect(port, host, () => {
    // TODO: send all current led states
    Log('Ledwall: connected');
    Matrix.connected = true;
    WebSocket.broadcast({
      type: 'status',
      status: Matrix.connected,
    });
  });

  client.on('data', (data) => {
    console.log('Received: ' + data);
  });

  client.on('error', (err) => {
    console.error(err);
    client.destroy();
  });

  client.on('close', () => {
    Log('Ledwall: disconnected');
    Matrix.connected = false;
    WebSocket.broadcast({
      type: 'status',
      status: Matrix.connected,
    });
    setTimeout(connect, 1000);
  });
}

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

function showLeds() {
  if (Matrix.connected) {
    serial.write([2], (err) => {
      if (err) {
        log(`Serial Error: ${err.message}`);
      }
    });
  }
}

function init(size) {
  Matrix.size = size;

  // connect to ledwall
  connect();


  loop();
  renderLoop();
  scriptEvents.emit('loaded');

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
    scriptEvents.emit('input', id, btns);
  });
}

module.exports = {
  start,
  stop,
  restart,
  resume,
  pause,
};
