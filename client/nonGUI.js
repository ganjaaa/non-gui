"use strict";

var nonGUI = {
    init: (settings) => {
        nonGUI.config = {
            user_token: null,
            connection: null,
            host: "ws://127.0.0.1:1337",
            interval: null,
            map: null,
        };
        $.extend(nonGUI.config, settings);

        nonGUI.setup();
    },
    setup: () => {

        // Check Socket
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
            alert('Sorry, but your browser doesn\'t support WebSockets.');
            return;
        }

        // Start Socket
        nonGUI.socket_connect();
        nonGUI.config.interval = setInterval(nonGUI.socket_check, 3000);

        // COmmand
        $(document).on('keydown', '#command', function (e) {
            if (e.keyCode === 13) {
                var msg = $(this).val();
                if (!msg) {
                    return;
                }

                nonGUI.config.connection.send(msg);
                $(this).val('');
            }
        });
    },

    debug: () => {

    },

    socket_connect: () => {
        nonGUI.config.connection = new WebSocket(nonGUI.config.host);
        nonGUI.config.connection.onopen = nonGUI.socket_onopen;
        nonGUI.config.connection.onerror = nonGUI.socket_onerror;
        nonGUI.config.connection.onmessage = nonGUI.socket_onmessage;
    },

    socket_check: () => {
        if (nonGUI.config.connection.readyState !== 1) {
            console.log('Unable to communicate with the WebSocket server.');
            nonGUI.config.connection = null;
            // TODO: Reconnect
        }
    },

    socket_onopen: () => {
        nonGUI.socket_send(nonGUI.config.user_token);
    },

    socket_onmessage: (message) => {
        try {
            var json = JSON.parse(message.data);
            nonGUI.set_world(json.world); 
            nonGUI.set_objects(json.objects);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }
    },

    socket_onerror: () => {
        alert('Sorry, but there\'s some problem with your connection or the server is down.');
    },

    socket_send: (message) => {
        if (nonGUI.config.connection) {
            nonGUI.config.connection.send(message);
        }
    },

    set_world: (world) => {
        $('#val_weather_description').text(world.weather_description);
        $('#val_wind_source').text(world.wind_source);
        $('#val_beauford_value').text(world.beauford_value);
        $('#val_wind_speed').text(world.wind_speed);
        $('#val_wave_height').text(world.wave_height);
    },

    set_objects: (objects) => {
        console.log(objects);
        for(var i = 0; i < objects.length; i++) {
            var object = objects[i];
            $('#debug').html(JSON.stringify(object, null, 2));
        }
    }
};