class Debug {
  constructor(url) {
    console.log('Connected to debug:', url);

    this.connected = false;
  }

  send(data) {
    if (!this.connected) { return; }
    console.log('debug', data);
  }
}

module.exports = Debug;
