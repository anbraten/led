module.exports = {
  development: {
    matrix: {
      size: 10
    },
    web: {
      port: 8484,
      root: '/public',
      websocket: {
        address: 'ws://localhost:8080',
        port: 8080
      }
    },
    auth: {
      autoLogin: true,
      password: null
    },
    scripts: {
      path: '/scripts',
      autoStart: 'pingpong'
    }
  },
  production: {
    matrix: {
      size: 10
    },
    web: {
      port: 80,
      root: '/public',
      websocket: {
        address: 'wss://led.example.org/ws',
        port: 8080
      }
    },
    auth: {
      autoLogin: false,
      password: 'supersecure'
    },
    scripts: {
      path: '/scripts',
      autoStart: 'pingpong'
    }
  }
}
