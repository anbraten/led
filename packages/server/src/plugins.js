const path = require('path');
const fs = require('fs');
const log = require('./log');

let plugin;
let bus;

function list(cb) {
  const dir = path.join(__dirname, '..', 'plugins');
  fs.readdir(dir, (e, files) => {
    if (e) {
      log(e);
    }

    // only list .js files
    cb(files.filter(item => (/(.*).js$/g).test(item)));
  });
}

function unload() {
  if (plugin) {
    const { id } = plugin;
    plugin = null;
    delete require.cache[path.join(__dirname, '..', 'plugins', id)];
  }
}

function load(pluginName) {
  if (plugin) {
    unload();
  }

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    plugin = require(path.join(__dirname, '..', 'plugins', pluginName));
    plugin.id = pluginName;
    return plugin;
  } catch (e) {
    log(e);
  }

  return null;
}

function init(_bus) {
  bus = _bus;

  bus.on('plugins:get', () => {
    list((plugins) => {
      bus.emit('plugins', plugins);
    });
  });
}

module.exports = {
  init,
  list,
  load,
  unload,
};
