const net = require('net');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

const BUTTON_1 = 2;
const BUTTON_2 = 1;
const BUTTON_A = 8;
const BUTTON_B = 4;
const BUTTON_PLUS = 4096;
const BUTTON_MINUS = 16;
const BUTTON_LEFT = 256;
const BUTTON_RIGHT = 512;
const BUTTON_UP = 2048;
const BUTTON_DOWN = 1024;
const BUTTON_HOME = 128;

const wiimotes = [];

function on(name, cb) {
  emitter.on(name, cb);
}

function emit(name, id, data) {
  emitter.emit(name, id, data);
}

function Wiimote(id, send) {
  this.id = id;
  this.error = 0;
  this.acc = [0, 0, 0];
  this.ir = {};
  this.rawButtons = 0;
  this.battery = 0;
  this.send = send;

  this.led = (val) => {
    this.send(`${this.id}$led$${val}`);
  };

  this.rumble = (val) => {
    this.send(`${this.id}$rumble$${val ? 'true' : 'false'}`);
  };

  this.buttons = () => {
    const btn = this.rawButtons;
    const btns = {
      btn1: (btn & BUTTON_1) === BUTTON_1,
      btn2: (btn & BUTTON_2) === BUTTON_2,
      a: (btn & BUTTON_A) === BUTTON_A,
      b: (btn & BUTTON_B) === BUTTON_B,
      plus: (btn & BUTTON_PLUS) === BUTTON_PLUS,
      minus: (btn & BUTTON_MINUS) === BUTTON_MINUS,
      up: (btn & BUTTON_UP) === BUTTON_UP,
      left: (btn & BUTTON_LEFT) === BUTTON_LEFT,
      down: (btn & BUTTON_DOWN) === BUTTON_DOWN,
      right: (btn & BUTTON_RIGHT) === BUTTON_RIGHT,
      home: (btn & BUTTON_HOME) === BUTTON_HOME,
    };
    return btns;
  };

  this.update = (key, value) => {
    if (key === 'acc') {
      this.acc = value;
      emit('acc', this.id, this.acc);
    }

    if (key === 'ir') {
      this.ir = value;
      emit('ir', this.id, this.ir);
    }

    if (key === 'buttons') {
      this.rawButtons = value;
      emit('button', this.id, this.buttons());
    }

    if (key === 'error') {
      this.error = value;
      emit('errors', this.id, this.error);
    }

    if (key === 'battery') {
      this.battery = value;
      emit('battery', this.id, this.battery);
    }
  };
}

// //////////////////////////////////////////////////////
// Remote functions
// //////////////////////////////////////////////////////

function connect(host, port) {
  const client = net.Socket();
  let buffer = '';

  console.log(`Remotes: connecting via ${host}:${port} ...`);

  client.connect({ host, port }, () => {
    console.log('Remotes: connected');
  });

  client.on('data', (_data) => {
    let data;
    buffer += _data.toString('utf8');
    while (buffer.includes('\n')) {
      const index = buffer.indexOf('\n');
      try {
        data = JSON.parse(buffer.substr(0, index));
      } catch (e) {
        console.log('error', e);
        return;
      }
      buffer = buffer.substr(index + 1);

      if ('id' in data && 'key' in data && 'value' in data) {
        if (!(data.id in wiimotes)) {
          wiimotes[data.id] = new Wiimote(data.id, (str) => {
            client.write(`${str}\n`);
          });
          wiimotes[data.id].led(data.id + 1);
          console.log(`Remotes: wiimote ${data.id} detected`);
        }
        wiimotes[data.id].update(data.key, data.value);
      }
    }
  });

  client.on('error', (err) => {
    console.log('Remotes: connection error', err);
    client.destroy();
  });

  client.on('close', () => {
    console.log('Remotes: disconnected');
    setTimeout(() => {
      connect(host, port);
    }, 1000);
  });
}

function init() {
  connect('127.0.0.1', 5005);
}

function feedback() {
  for (let i = 0; i < wiimotes.length; i += 1) {
    wiimotes[i].rumble(true);
  }
  setTimeout(() => {
    for (let i = 0; i < wiimotes.length; i += 1) {
      wiimotes[i].rumble(false);
    }
  }, 100);
}

// EXPORTS
module.exports = {
  init,
  connect,
  feedback,
  on,
};
