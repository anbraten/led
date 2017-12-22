var socket = connectWebsocket(webSocketURL('ws'));

var app = new Vue({
    'el': '#app',

    'data': {
        'loaded': false,
        'isAdmin': false,
        'debug': false,
        'leds': null,
        'scripts': null,
        'connected': false,
        'status': false,
        'running_script': null,
        'team': null,
        'inputs': [],
    },

    mounted: function () {
        this.loaded = true;
        console.log('LED 0.1');
        console.log(window.location.hash);
        this.isAdmin = (window.location.hash == '#admin');
        this.debug = this.isAdmin ? true : this.debug;
        this.debug = (window.location.hash == '#debug') ? true : this.debug;
        this.loadData();
        setInterval(function () {
            this.loadData();
        }.bind(this), 50);
    },

    methods: {
        loadData: function () {
            this.call({
                'type': 'list_scripts',
                'assign': 'scripts'
            });
            this.call({
                'type': 'status',
                'assign': 'status'
            });
            this.call({
                'type': 'running_script',
                'assign': 'running_script'
            });
            this.call({
                'type': 'inputs',
                'assign': 'inputs'
            });
            if (this.debug)
                this.call({
                    'type': 'leds',
                    'assign': 'leds'
                });
        },
        call: function (data) {
            if (socket && socket.readyState === socket.OPEN) {
                socket.send(JSON.stringify(data));
            }
        },
        launchScript: function (script) {
            this.call({
                'type': 'launch_script',
                'script': script
            });
        },
        stopScript: function () {
            this.call({
                'type': 'stop_script'
            });
        },
        rgb: function (led) {
            return 'rgb(' + led.r + ',' + led.g + ',' + led.b + ')';
        },
        input: function(event) {
            this.call({
                'type': 'input',
                'event': event
            });
        },
        control: function(event) {
            this.input({
                'team': this.team,
                'event': event
            });
        },
        isInputActive: function(button) {
            return this.inputs.indexOf(button) != -1;
        }
    }
});

function connectWebsocket(url) {
    var res = new WebSocket(url);

    res.onopen = (e) => {
        console.log('WebSocket connected');
        app.connected = true;
    };
    res.onerror = (e) => {
        console.log(e);
    };
    res.onclose = (e) => {
        socket = false;
    };
    res.onmessage = (e) => {
        let data;
        try {
            data = JSON.parse(e.data);
        } catch (e) {
            console.log(e);
        }
        if (data) {
            app[data.assign] = data.content;
        }
    };
    res.onclose = (e) => {
        console.log('Websocket disconnected');
        app.connected = false;
        setTimeout(() => {
            console.log('Websocket reconnecting ...');
            socket = connectWebsocket(url);
        }, 1000);
    };
    return res;
}

function webSocketURL(s) {
    var l = window.location;
    return ((l.protocol === "https:") ? "wss://" : "ws://") + l.hostname + (((l.port != 80) && (l.port != 443)) ? ":" + l.port : "") + l.pathname + s;
}