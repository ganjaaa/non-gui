"use strict";
process.title = 'non-gui-server';

// Includes
const config = require('./config');
const webSocketServer = require('websocket').server;
const { SocketHandler } = require('./classes/socket_handler.js');
const http = require('http');

// HTTP server
var server = http.createServer((request, response) => { });
server.listen(config.server_port, () => { console.log("Server is listening on port " + config.server_port); });

// WebSocket server
var wsServer = new webSocketServer({ httpServer: server });
const wsHandler = new SocketHandler(config.admin_token, config.player_token);
wsServer.on('request', wsHandler.onRequest);