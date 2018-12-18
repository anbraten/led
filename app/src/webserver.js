const express = require('express');
const path = require('path');
const websocket = require('./websocket');

const app = express();

function init() {
  const webRoot = path.join(__dirname, '..', '..', 'web');

  // Express (static app files)
  app.use(express.static(webRoot));

  app.get('/*', (req, res) => {
    res.sendFile(path.join(webRoot, 'index.html'));
  });

  app.on('error', (err) => {
    console.error('server error', err);
  });

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
    websocket.init(server);
  });
}

module.exports = {
  init,
};
