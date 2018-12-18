const Matrix = require('./src/matrix');
const Scripts = require('./src/scripts');
const Webserver = require('./src/webserver');

(() => {
  // start webserver
  Webserver.init();

  Matrix.init();

  Scripts.init();

  if (config.matrix.serialPort) {
    serial.init(config.matrix.serialPort);
    serial.on('connected', () => {
      // TODO: send all current led states
      log('Serial: connected');
      Matrix.connected = true;
      webSocket.broadcast({
        type: 'status',
        status: Matrix.connected,
      });
    });
    serial.on('disconnected', () => {
      log('Serial: closed');
      Matrix.connected = false;
      webSocket.broadcast({
        type: 'status',
        status: Matrix.connected,
      });
    });
  }


  // Matrix
  Matrix.init(config.matrix.size);
  Matrix.onSystem('broadcastLed', (id, rgb) => {
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
  });

  Matrix.onSystem('showLeds', () => {
    if (Matrix.connected) {
      serial.write([2], (err) => {
        if (err) {
          log(`Serial Error: ${err.message}`);
        }
      });
    }
  });

  const autoStart = process.env.SCRIPT_AUTOSTART;

  if (autoStart || null) {
    scripts.launch(autoStart);
  }
})();
