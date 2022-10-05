"use strict";
process.title = 'non-gui-server';

// Config Part
const server_port = 8888;
const admin_token = '2c713c22-82f6-4ec4-a9e0-d437e17ebd57';
const player_token = '60524bc0-f984-4c55-a4df-ca97763ff8f3';

// Includes
const webSocketServer = require('websocket').server;
const { SocketHandler } = require('./classes.js');
const http = require('http');

// HTTP server
var server = http.createServer((request, response) => { });
server.listen(server_port, () => { console.log("Server is listening on port " + server_port); });

// WebSocket server
var wsServer = new webSocketServer({ httpServer: server });
const wsHandler = new SocketHandler(admin_token, player_token);
wsServer.on('request', wsHandler.onRequest);