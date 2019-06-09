const websocket = require('./websocket');

module.exports = (msg) => {
  console.log(msg);
  websocket.broadcast('log', msg);
};
