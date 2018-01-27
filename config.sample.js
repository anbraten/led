module.exports = {
  development: {
    matrix: {
      size: 10
    },
    mqtt: {
      server: 'iot.eclipse.org',
      user: null,
      password: null,
      topic: 'led/matrix'
    },
    web: {
      port: 8484,
      root: '/public',
      websocket: {
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
    mqtt: {
      server: 'iot.eclipse.org',
      user: null,
      password: null,
      topic: 'led/matrix'
    },
    web: {
      port: 80,
      root: '/public',
      websocket: {
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
