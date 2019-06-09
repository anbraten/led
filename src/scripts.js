const path = require('path');
const fs = require('fs');
const log = require('./log');
const webSocket = require('./websocket');
const Matrix = require('./matrix');

let script;

function init() {

}

function list(cb) {
  const dir = path.join(__dirname, '..', '..', 'scripts');
  fs.readdir(dir, (e, files) => {
    if (e) {
      log(e);
    }
    // only list .js files
    cb(files.filter(item => (/(.*).js$/g).test(item)));
  });
}

function stop() {
  if (script) {
    const { id } = script;
    Matrix.stop();
    script = null;
    delete require.cache[path.join(__dirname, '..', '..', 'scripts', id)];
    webSocket.broadcast({
      type: 'script',
      script: null,
    });
    list((files) => {
      webSocket.broadcast({
        type: 'scripts',
        scripts: files,
      });
    });
  }
}

function load(scriptName) {
  if (script) {
    stop();
  }
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    script = require(path.join(__dirname, '..', '..', 'scripts', scriptName));
    script.id = scriptName;
    script.init(Matrix);
    Matrix.start();
    webSocket.broadcast({
      type: 'script',
      script: script.id,
    });
  } catch (e) {
    log(e);
  }
}

module.exports = {
  init,
  list,
  load,
  stop,
};
