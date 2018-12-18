const websocket = require('./websocket');

module.exports = (msg) => {
  console.log(msg);
  websocket.broadcast({
    type: 'log',
    log: msg,
  });
};
