const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

const Websocket = require('./websocket');
const Log = require('./log');

const PORT = process.env.PORT || 8080;

function init() {
  // Express (static app files)
  app.use(express.static(path.join(__dirname, '..', 'spa', 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'spa', 'index.html'));
  });

  app.on('error', (err) => {
    Log('server error', err);
  });

  Websocket.init(server);

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}!`);
  });
}

module.exports = {
  init,
};
