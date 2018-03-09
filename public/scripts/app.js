var socket

// eslint-disable-next-line
var app = new Vue({
  'el': '#app',

  'data': {
    'loaded': false,
    'view': 'scripts',
    'showAuth': false,
    'showControls': false,
    'connected': false,
    'debug': false,

    'auth': false,
    'status': false,
    'scripts': null,
    'script': null,
    'leds': [],
    'inputs': [],
    'logs': []
  },

  created: function () {
    this.loaded = true
    for (let i = 0; i < 100; i++) {
      this.leds[i] = {
        'r': 0,
        'g': 0,
        'b': 0
      }
    }
    this.log('LED 0.2')
  },

  methods: {
    init: function () {
    },
    send: function (data) {
      if (socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(data))
      }
    },
    launchScript: function (script) {
      this.send({
        'type': 'launch_script',
        'script': script
      })
    },
    stopScript: function () {
      this.send({
        'type': 'stop_script'
      })
    },
    led: function (id, rgb) {
      if (this.leds.length === 100) {
        this.$set(this.leds, id, rgb)
      }
    },
    rgb: function (led) {
      return 'rgb(' + led.r + ',' + led.g + ',' + led.b + ')'
    },
    input: function (event) {
      this.send({
        'type': 'input',
        'event': event
      })
    },
    control: function (event) {
      this.input({
        'event': event
      })
    },
    isInputActive: function (button) {
      return this.inputs.indexOf(button) !== -1
    },
    log: function (data) {
      this.logs.push({
        'time': new Date(),
        'message': data
      })
    },
    login: function () {
      var password = this.$refs.password.value
      document.cookie = 'auth=' + password + ';path=/;'
      this.send({
        'type': 'login',
        'password': password
      })
    },
    logout: function () {
      this.send({
        'type': 'logout'
      })
    }
  }
})

// socket = connectWebsocket('ws://localhost:8080')
socket = connectWebsocket('wss://led.ju60.de/ws')

function connectWebsocket (url) {
  app.init()
  var res = new WebSocket(url)

  res.onopen = (e) => {
    app.log('WebSocket: connected')
    app.connected = true
    app.auth = false
    // autlogin user with cookie
    var password = getCookie('auth')
    if (password) {
      app.send({
        'type': 'login',
        'password': password
      })
    }
  }
  res.onerror = (e) => {
  }
  res.onmessage = (e) => {
    parseWebSocket(e.data)
  }
  res.onclose = (e) => {
    app.log('WebSocket: disconnected')
    app.connected = false
    setTimeout(() => {
      socket = connectWebsocket(url)
    }, 1000)
  }
  return res
}

function parseWebSocket (raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    return
  }
  if (data) {
    switch (data.type) {
      case 'status':
        app.status = data.status
        break
      case 'script':
        app.script = data.script
        if (data.script === null) {
          app.log('Script: stopped')
          app.showControls = false
        } else {
          app.log('Script: started [' + data.script + ']')
          app.showControls = true
        }
        break
      case 'scripts':
        app.scripts = data.scripts
        break
      case 'auth':
        if (data.auth) {
          app.log('Auth: logged in')
        } else {
          app.leds = []
          document.cookie = 'auth=;path=/'
          app.log('Auth: logged out')
        }
        app.showAuth = false
        app.auth = data.auth
        break
      case 'log':
        app.log(data.log)
        break
      case 'led':
        app.led(data.id, data.rgb)
        break
    }
  }
}

function getCookie (name) {
  var value = new RegExp(name + '=([^;]+)').exec(document.cookie)
  return (value != null) ? unescape(value[1]) : null
}
