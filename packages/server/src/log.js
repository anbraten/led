let bus;

function log(...args) {
  if (args.length === 1 && args[0] === undefined) { return; }

  console.log(...args);

  if (bus) {
    bus.emit('broadcast', ...args);
  }
}

module.exports = (msg) => {
  log(msg);

  return {
    init: (_bus) => {
      bus = _bus;
      bus.on('log', log);
    },
  };
};
