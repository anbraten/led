let socket;
let app;

function getCookie(name) {
  const value = new RegExp(`${name}=([^;]+)`).exec(document.cookie);
  return (value != null) ? unescape(value[1]) : null;
}

function parseWebSocket(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return;
  }
  if (data) {
    switch (data.type) {
      case 'status':
        app.status = data.status;
        break;
      case 'script':
        app.script = data.script;
        if (data.script === null) {
          app.log('Script: stopped');
          app.showControls = false;
        } else {
          app.log(`Script: started [${data.script}]`);
          app.showControls = true;
        }
        break;
      case 'scripts':
        app.scripts = data.scripts;
        break;
      case 'auth':
        if (data.auth) {
          app.log('Auth: logged in');
        } else {
          app.leds = [];
          document.cookie = 'auth=;path=/';
          app.log('Auth: logged out');
        }
        app.showAuth = false;
        app.auth = data.auth;
        break;
      case 'log':
        app.log(data.log);
        break;
      case 'led':
        app.led(data.id, data.rgb);
        break;
      default:
        break;
    }
  }
}

function connectWebsocket(url) {
  app.init();
  const res = new WebSocket(url);

  res.onopen = () => {
    app.log('WebSocket: connected');
    app.connected = true;
    app.auth = false;
    // autlogin user with cookie
    const password = getCookie('auth');
    if (password) {
      app.send({
        type: 'login',
        password,
      });
    }
  };
  res.onerror = () => {};
  res.onmessage = (e) => {
    parseWebSocket(e.data);
  };
  res.onclose = () => {
    app.log('WebSocket: disconnected');
    app.connected = false;
    setTimeout(() => {
      socket = connectWebsocket(url);
    }, 1000);
  };
  return res;
}

// eslint-disable-next-line no-undef
app = new Vue({
  el: '#app',

  data: {
    loaded: false,
    view: 'scripts',
    showAuth: false,
    showControls: false,
    connected: false,
    debug: false,

    auth: false,
    status: false,
    scripts: null,
    script: null,
    leds: [],
    inputs: [],
    logs: [],
  },

  created() {
    this.loaded = true;
    for (let i = 0; i < 100; i += 1) {
      this.leds[i] = {
        r: 0,
        g: 0,
        b: 0,
      };
    }
    this.log('LED 0.2');
  },

  methods: {
    init() {},
    send(data) {
      if (socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    },
    launchScript(script) {
      this.send({
        type: 'launch_script',
        script,
      });
    },
    stopScript() {
      this.send({
        type: 'stop_script',
      });
    },
    led(id, rgb) {
      if (this.leds.length === 100) {
        this.$set(this.leds, id, rgb);
      }
    },
    rgb(led) {
      return `rgb(${led.r},${led.g},${led.b})`;
    },
    input(event) {
      this.send({
        type: 'input',
        event,
      });
    },
    control(event) {
      this.input({
        event,
      });
    },
    isInputActive(button) {
      return this.inputs.indexOf(button) !== -1;
    },
    log(data) {
      this.logs.push({
        time: new Date(),
        message: data,
      });
    },
    login() {
      const password = this.$refs.password.value;
      document.cookie = `auth=${password};path=/;`;
      this.send({
        type: 'login',
        password,
      });
    },
    logout() {
      this.send({
        type: 'logout',
      });
    },
  },
});

socket = connectWebsocket(`ws://${window.location.host}/`);
