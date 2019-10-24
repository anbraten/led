require('dotenv').config();
const Events = require('events');

const Loop = require('./loop');
const Webserver = require('./webserver');
const Log = require('./log');

const bus = new Events.EventEmitter();

function init() {
  Log().init(bus);

  Webserver.init(bus);

  Loop.init(bus);

  Log('Ledmatrix V0.1 started');
}

init();
