"use strict";

process.title = 'non-gui-server';
const server_port = 8888;
// You should change these tokens
const admin_token = '2c713c22-82f6-4ec4-a9e0-d437e17ebd57';
const player_token = '60524bc0-f984-4c55-a4df-ca97763ff8f3';

const webSocketServer = require('websocket').server;
const { ifError } = require('assert');
const http = require('http');
const Classes = require('./classes.js');

var world = new Classes.World();
var objects = [];
var user = [];

objects.push(new Classes.WorldItem(objects.length, "MS Demo", false, "ship.png"));


var server = http.createServer(function (request, response) {
    // Empty
});
server.listen(server_port, function () {
    console.log((new Date()) + " Server is listening on port " + server_port);
});

var wsServer = new webSocketServer({
    httpServer: server
});

wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    // TODO: SameOriginPolicy
    var connection = request.accept(null, request.origin);

    // we need to know client index to remove them on 'close' event
    var index = user.push(connection) - 1;
    var is_admin = false;
    var is_player = false;
    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    //if (history.length > 0) {
    //    connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
    //}

    connection.on('message', function (message) {
        if (message.type === 'utf8') { // accept only text
            if (is_admin === false && is_player === false) {
                if (message.utf8Data === admin_token) {
                    is_admin = true;
                    console.log((new Date()) + ' Admin connected.');
                    broadcast_updates();
                } else if (message.utf8Data === player_token) {
                    is_player = true;
                    console.log((new Date()) + ' Player connected.');
                    broadcast_updates();
                }
                return;
            }

            console.log((new Date()) + ' Received Message from Admin: ' + message.utf8Data);

            try {
                var json = JSON.parse(message.utf8Data);
            } catch (e) {
                console.log('Invalid JSON: ', message.utf8Data);
                return;
            }

            if (is_admin === true) {
                switch (json[0]) {
                    case "world":
                        world.commands(json[1], json[2]);
                        break;
                    case "system":
                        commands(json[1], json[2]);
                        break;
                    default:
                        var num_index = parseInt(json[0]);
                        if (num_index >= 0 && num_index < objects.length) {
                            objects[index].commands(json[1], json[2]);
                        }
                        break;
                }
                broadcast_updates();
                return;
            }
        }
    });

    // user disconnected
    connection.on('close', function (connection) {
        if (is_admin !== false || is_player !== false) {
            console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
            user.splice(index, 1);
        }
    });
});

function broadcast_updates() {
    var data = {
        type: 'update',
        world: world.info(),
        objects: []
    };
    for (var i = 0; i < objects.length; i++) {
        data.objects.push(objects[i].info(world));
    }
    var json = JSON.stringify(data);
    for (var i = 0; i < user.length; i++) {
        user[i].send(json);
    }
}

function commands(cmd, val) {
    var data = {};

    switch (cmd) {
        case "import":
            var buff = Buffer.from(val, 'base64');
            var str = buff.toString('utf-8');
            var data = JSON.parse(str);

            world.import(data.world);
            objects = [];
            for (var i = 0; i < data.objects.length; i++) {
                objects.push(new Classes.WorldItem(0, "", false, ""));
                objects[i].import(data.objects[i]);
            }
            break;
        case "export":
            var data = {
                world: world.export(),
                objects: []
            }
            for (var i = 0; i < objects.length; i++) {
                data.objects.push(objects[i].export());
            }
            var buff = Buffer.from(JSON.stringify(data), 'utf-8');
            for (var i = 0; i < user.length; i++) {
                user[i].send(JSON.stringify({
                    type: 'export',
                    data: buff.toString('base64')
                }));
            }
            break;
    }
}