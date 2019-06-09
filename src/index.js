require('dotenv').config();

const Matrix = require('./matrix');
const Scripts = require('./scripts');
const Webserver = require('./webserver');
const Log = require('./log');

(() => {
  Webserver.init();

  Matrix.init();

  Scripts.init();

  const autoStart = process.env.SCRIPT_AUTOSTART;

  if (autoStart || null) {
    Scripts.launch(autoStart);
  }

  Log('Ledwall V0.1 started');
})();
