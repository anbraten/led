var socket = connectWebsocket(webSocketURL('ws'));

var app = new Vue({
    el: '#app',

    data: {
        debug: true,
        leds: null,
        games: null,
        connected: false,
        status: false,
        running_game: null,
        team: null,
    },

    mounted: function () {
        this.loadData();
        setInterval(function () {
            this.loadData();
        }.bind(this), 50);
    },

    methods: {
        loadData: function () {
            this.call({
                'type': 'list_games',
                'assign': 'games'
            });
            this.call({
                'type': 'status',
                'assign': 'status'
            });
            this.call({
                'type': 'running_game',
                'assign': 'running_game'
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
        launchGame: function (game) {
            this.call({
                'type': 'launch_game',
                'game': game
            });
        },
        stopGame: function () {
            this.call({
                'type': 'stop_game'
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
        // console.log(e);
    };
    res.onclose = (e) => {
        socket = false;
    };
    res.onmessage = (e) => {
        let data;
        try {
            data = JSON.parse(e.data);
        } catch(e) {
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