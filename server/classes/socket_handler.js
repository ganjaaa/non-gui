'use strict'

const { Dice } = require('./dice.js');
const { World } = require('./world.js');
const { WorldItem } = require('./world_item.js');

class SocketHandler {
    constructor(admin_token, player_token) {
        this.dice = new Dice();
        this.world = new World();
        this.edit_mode = true;
        this.objects = [];
        this.objects_map = {};
        this.user = [];
        this.admin_token = admin_token;
        this.player_token = player_token;
        this.update_objects_map();
        this.socketTimer = setInterval(this.broadcast_world, 10000);
    }

    onRequest = (request) => {
        var connection = request.accept(null, request.origin); // TODO: SameOriginPolicy

        // Vars
        var index = this.user.push(connection) - 1;
        var is_admin = false;
        var is_player = false;

        // onMessage
        connection.on('message', (message) => {
            if (message.type === 'utf8') {

                // First Messenge is always the token
                if (is_admin === false && is_player === false) {
                    if (message.utf8Data === this.admin_token) {
                        is_admin = true;
                        this.broadcast_world();
                        this.doLog('Admin connected.');
                    } else if (message.utf8Data === this.player_token) {
                        is_player = true;
                        this.broadcast_world();
                        this.doLog('Player connected.');
                    }
                    return;
                }

                // Parse JSON
                var json = this.parseJSON(message.utf8Data);
                if (json === false) {
                    return;
                }

                // if Connection is Admin
                if (is_admin === true) {
                    let response = this.handle_admin_commands(json);
                    if (response !== null) {
                        connection.send(JSON.stringify(response));
                    }
                    return;
                }

                // if Connection is Player
                if (is_player === true && this.edit_mode === false) {
                    let response = this.handle_player_commands(json);
                    if (response !== null) {
                        connection.send(JSON.stringify(response));
                    }
                    return;
                }
            }
        });

        // onClose
        connection.on('close', (connection) => {
            if (is_admin !== false || is_player !== false) {
                this.user.splice(index, 1);
            }
        });
    }

    handle_player_commands = (json) => {
        // Dice
        if (json[0] === "dice") {
            return this.dice.commands(json[1], json[2])
        }

        // Player controlled WorldItems
        if (this.objects_map.hasOwnProperty(json[0])) {
            if (this.objects[this.objects_map[json[0]]].player_controlled) {
                return this.objects[this.objects_map[json[0]]].commands(json[1], json[2]);
            }
        }

        return null;
    }

    handle_admin_commands = (json) => {
        // Dice
        if (json[0] === "dice") {
            return this.dice.commands(json[1], json[2])
        }

        // System
        if (json[0] === "system") {
            return this.commands(json[1], json[2]);
        }

        // World
        // TODO: Refactor
        if (json[0] === "world") {
            return this.world.commands(json[1], json[2]);
        }


        // World Items
        // TODO: Refactor
        if (this.objects_map.hasOwnProperty(json[0])) {
            return this.objects[this.objects_map[json[0]]].commands(json[1], json[2]);
        }

        // Nothing
        return null;
    }

    commands = (cmd, val) => {
        switch (cmd) {
            // change Edit Mode
            case "editmode":
                this.edit_mode = val;
                return null;

            // Broadcast World
            case "broadcast":
                this.broadcast_world();
                return null;

            // Add new WorldItem
            case "add":
                var newId = this.world.getNextId();
                this.objects.push(new WorldItem(newId));
                this.update_objects_map();
                return ["system", "add", newId];

            // Remove Worlditem
            case "del":
                if (this.objects_map.hasOwnProperty(val)) {
                    this.objects.splice(this.objects_map[val], 1);
                }
                this.update_objects_map();
                return null;

            // Export all
            case "export":
                var data = {
                    world: this.world.export(),
                    objects: []
                }
                for (var i = 0; i < this.objects.length; i++) {
                    data.objects.push(this.objects[i].export());
                }
                var exp = Buffer.from(JSON.stringify(data), 'utf-8').toString('base64');
                return ["system", "export", exp];

            // Import all
            case "import":
                var data = JSON.parse(Buffer.from(val, 'base64').toString('utf-8'));
                this.world.import(data.world);
                this.objects = [];
                for (var i = 0; i < data.objects.length; i++) {
                    this.objects.push(new WorldItem(data.objects[i][0]));
                    this.objects[i].import(data.objects[i]);
                }
                this.update_objects_map();
                this.broadcast_all();
                return null;
            default:
                return null;
        }
    }

    update_objects_map = () => {
        this.objects_map = {};
        for (var i = 0; i < this.objects.length; i++) {
            this.objects_map[this.objects[i].id] = this.objects[i];
        }
    }

    broadcast_all = (message) => {
        var json = JSON.stringify(message);
        for (var i = 0; i < this.user.length; i++) {
            this.user[i].send(json);
        }
    }

    broadcast_world = () => {
        var data = {
            editmode: this.edit_mode,
            world: this.world.info(),
            objects: []
        };

        for (var i = 0; i < this.objects.length; i++) {
            data.objects.push(this.objects[i].info(this.world));
        }
        this.broadcast_all(["world", "update", data]);
    }

    parseJSON = (json_string) => {
        this.doLog('Received Message: ' + json_string);
        try {
            return JSON.parse(json_string);
        } catch (e) {
            this.doLog('Invalid JSON!');
            return false;
        }
    }

    doLog = (msg) => {
        console.log((new Date()) + " " + msg);
    }
}

module.exports = { SocketHandler }