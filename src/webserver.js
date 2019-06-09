const express = require('express');
const path = require('path');
const Websocket = require('./websocket');
const Log = require('./log');

const app = express();

function init() {
  const webRoot = path.join(__dirname, '..', '..', 'web');

  // Express (static app files)
  app.use(express.static(webRoot));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(webRoot, 'index.html'));
  });

  app.on('error', (err) => {
    Log('server error', err);
  });

  const port = process.env.PORT || 8080;
  const server = app.listen(port, () => {
    Log(`Server listening on port ${port}!`);
    Websocket.init(server);
  });
}

module.exports = {
  init,
};
