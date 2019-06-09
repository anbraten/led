// tcp connect
const net = require('net');
const host = process.NODE_ENV.LEDWALL_HOST;
const port = process.NODE_ENV.LEDWALL_PORT;

let client = new net.Socket();
client.connect(port, host, () => {
  // TODO: send all current led states
  Log('Ledwall: connected');
  Matrix.connected = true;
  WebSocket.broadcast({
    type: 'status',
    status: Matrix.connected,
  });
});

client.on('data', (data) => {
  console.log('Received: ' + data);
});

client.on('error', (err) => {
  console.error(err);
  client.destroy();
});

client.on('close', () => {
  Log('Ledwall: disconnected');
  Matrix.connected = false;
  WebSocket.broadcast({
    type: 'status',
    status: Matrix.connected,
  });
  setTimeout(connect, 1000);
});
