require('dotenv').config();

const Loop = require('./loop');
const Webserver = require('./webserver');
const Log = require('./log');

function init() {
  Webserver.init();

  Loop.init();

  Log('Ledmatrix V0.1 started');
}

init();
