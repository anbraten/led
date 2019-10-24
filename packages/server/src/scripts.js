const path = require('path');
const fs = require('fs');
const log = require('./log');

let script;
let bus;

function list(cb) {
  const dir = path.join(__dirname, '..', 'scripts');
  fs.readdir(dir, (e, files) => {
    if (e) {
      log(e);
    }

    // only list .js files
    cb(files.filter(item => (/(.*).js$/g).test(item)));
  });
}

function unload() {
  if (script) {
    const { id } = script;
    script = null;
    delete require.cache[path.join(__dirname, '..', 'scripts', id)];
  }
}

function load(scriptName) {
  if (script) {
    unload();
  }

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    script = require(path.join(__dirname, '..', 'scripts', scriptName));
    script.id = scriptName;
    return script;
  } catch (e) {
    log(e);
  }

  return null;
}

function init(_bus) {
  bus = _bus;

  bus.on('scripts:get', () => {
    list((scripts) => {
      bus.emit('scripts', scripts);
    });
  });
}

module.exports = {
  init,
  list,
  load,
  unload,
};
