'use strict'

const crypto = require('crypto');

const beauford_scale = [
    ["Calm", 0, 0],
    ["Light air", 2, 1],
    ["Light breeze", 5, 2],
    ["Gentle breeze", 9, 3],
    ["Moderate breeze", 14, 5],
    ["Fresh breeze", 19, 8],
    ["Strong breeze", 25, 11],
    ["High wind", 31, 16],
    ["Gale", 37, 22],
    ["Strong gale", 44, 27],
    ["Storm", 51, 35],
    ["Violent storm", 60, 45],
    ["Hurricane", 70, 56],
];

class SocketHandler {
    constructor(admin_token, player_token) {
        this.world = new World();
        this.objects = [];
        this.objects_map = {};
        this.user = [];
        this.admin_token = admin_token;
        this.player_token = player_token;
        this.update_objects_map();
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

                if (is_admin === true) {
                    this.handle_admin_commands(json);
                }

                if (is_player === true) {
                    // TODO: Player commands
                }

                // Send world to player
                this.broadcast_world();
            }
        });

        // onClose
        connection.on('close', (connection) => {
            if (is_admin !== false || is_player !== false) {
                this.user.splice(index, 1);
            }
        });

    }

    handle_admin_commands = (json) => {
        if (json[0] === "system") {
            this.commands(json[1], json[2]);
            return;
        }

        if (json[0] === "world") {
            this.world.commands(json[1], json[2]);
            return;
        }

        if (this.objects_map.hasOwnProperty(json[0])) {
            this.objects[this.objects_map[json[0]]].commands(json[1], json[2]);
        }
    }

    commands = (cmd, val) => {
        if (cmd == "add") {
            this.objects.push(new WorldItem(this.world.getNextId()));
            this.update_objects_map();
            return;
        }

        if (cmd == "del") {
            if (this.objects_map.hasOwnProperty(val)) {
                this.objects.splice(this.objects_map[val], 1);
            }
            this.update_objects_map();
            return;
        }

        if (cmd == "export") {
            var data = {
                world: this.world.export(),
                objects: []
            }
            for (var i = 0; i < this.objects.length; i++) {
                data.objects.push(this.objects[i].export());
            }
            this.broadcast_all({
                type: 'export',
                data: Buffer.from(JSON.stringify(data), 'utf-8').toString('base64')
            });
            return;
        }

        if (cmd == "import") {
            var data = JSON.parse(Buffer.from(val, 'base64').toString('utf-8'));
            this.world.import(data.world);
            this.objects = [];
            for (var i = 0; i < data.objects.length; i++) {
                this.objects.push(new WorldItem(data.objects[i][0]));
                this.objects[i].import(data.objects[i]);
            }
            this.update_objects_map();
            return;
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
            type: 'update',
            world: this.world.info(),
            objects: []
        };

        for (var i = 0; i < this.objects.length; i++) {
            data.objects.push(this.objects[i].info(this.world));
        }
        this.broadcast_all(data);
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

class Dice {
    /**
     * Get a Random Nummber between min and max
     * 
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    getRandom = (min, max) => {
        return crypto.randomInt(min, max);
    }

    /**
     * Calculate the min roll of an dice string like 2d6+3
     * 
     * @param {string} dice_string 
     * @returns {number}
     */
    calculateMin = (dice_string) => {
        var result = 0;
        var dice_parts = dice_string.split("+");
        for (var p = 0; p < dice_parts.length; p++) {
            if (dice_parts[p].index('d') > -1) {
                var dice = dice_parts[p].split("d");
                result += dice[0];
            } else {
                result += parseInt(dice_parts[p]);
            }
        }
        return result;
    }

    /**
     * Calculate the roll of an dice string like 2d6+3
     * 
     * @param {string} dice_string 
     * @returns {number}
     */
    calculate = (dice_string) => {
        var result = 0;
        var dice_parts = dice_string.split("+");
        for (var p = 0; p < dice_parts.length; p++) {
            if (dice_parts[p].index('d') > -1) {
                var dice = dice_parts[p].split("d");
                for (var i = 0; i < dice[0]; i++) {
                    result += this.getRandom(1, dice[1]);
                }
            } else {
                result += parseInt(dice_parts[p]);
            }
        }
        return result;
    }

    /**
     * Calculate the max roll of an dice string like 2d6+3
     * 
     * @param {string} dice_string 
     * @returns {number}
     */
    calculateMax = (dice_string) => {
        var result = 0;
        var dice_parts = dice_string.split("+");
        for (var p = 0; p < dice_parts.length; p++) {
            if (dice_parts[p].index('d') > -1) {
                var dice = dice_parts[p].split("d");
                for (var i = 0; i < dice[0]; i++) {
                    result += dice[1];
                }
            } else {
                result += parseInt(dice_parts[p]);
            }
        }
        return result;
    }
}

class World {
    constructor() {
        this.oid = 0;
        this.wind_source = 45; // Windrichtung in grad (0-360), 0 = Norden WINDQUELLE
        this.beauford_value = 4; // Borfor Scala 1-12 
    }

    export = () => {
        return [this.oid, this.wind_source, this.beauford_value];
    }

    import = (data) => {
        this.oid = data[0];
        this.wind_source = data[1];
        this.beauford_value = data[2];
    }

    info = () => {
        return {
            wind_source: this.wind_source,
            beauford_value: this.beauford_value,
            weather_description: beauford_scale[this.beauford_value][0],
            wind_speed: beauford_scale[this.beauford_value][1],
            wave_height: beauford_scale[this.beauford_value][2],
        }
    }

    commands = (cmd, val) => {
        switch (cmd) {
            case "wind_source":
                this.wind_source = val;
                break;
            case "beauford_value":
                this.beauford_value = val;
                break;
        }
    }

    getNextId = () => {
        this.oid++;
        return this.oid;
    }

    getWindSource = () => {
        return this.wind_source;
    }

    setWindSource = (value) => {
        if (value < 0 || value > 360) {
            console.log("Beauford Value out of range");
            return;
        }
        this.wind_source = value;
    }

    getBeaufordValue = () => {
        return this.beauford_value;
    }

    setBeaufordValue = (value) => {
        if (value < 0 || value > 12) {
            console.log("Beauford Value out of range");
            return;
        }
        this.beauford_value = value;
    }

    getWeatherDescription = () => {
        return beauford_scale[this.beauford_value][0];
    }

    getWindSpeed = () => {
        return beauford_scale[this.beauford_value][1];
    }

    getWaveHeight = () => {
        return beauford_scale[this.beauford_value][2];
    }

}

class WorldItem {

    constructor(id) {
        this.id = parseInt(id);        // ID
        this.is_static = false; // Beweglich oder nicht
        this.name = "New World Item";   // Name
        this.description = "";  // Beschreibung
        this.image = "default.png"; // Bild
        this.x = 0; // Position X
        this.y = 0; // Position Y
        this.orientation = 0; // Richting in Grad (0-360), 0 = Norden
        this.player_controlled = false; // Spieler gesteuert
        this.sail_area = 0; // 0.0 - 1.0 // Kommt von Player wird manuell bestimmt 
        this.position_factor = 0; // Berechnet aus 
        this.weight_penalty = 1; // 1 und 0.5 // Kommt von Player wird manuell bestimmt

        this.weapons = [];
    }

    export = () => {
        return [
            this.id,
            this.is_static,
            this.name,
            this.description,
            this.image,
            this.x,
            this.y,
            this.orientation,
            this.player_controlled,
            this.sail_area,
            this.position_factor,
            this.weight_penalty
        ];
    }

    import = (data) => {
        this.id = data[0];
        this.is_static = data[1];
        this.name = data[2];
        this.description = data[3];
        this.image = data[4];
        this.x = data[5];
        this.y = data[6];
        this.orientation = data[7];
        this.player_controlled = data[8];
        this.sail_area = data[9];
        this.position_factor = data[10];
        this.weight_penalty = data[11];
    }

    info = (world) => {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            image: this.image,
            x: this.x,
            y: this.y,
            orientation: this.orientation,
            player_controlled: this.player_controlled,
            sail_area: this.sail_area,
            weight_penalty: this.weight_penalty,
            weapons: this.weapons,
            position_factor: this.getPositionFactor(world),
            travel_speed: this.getTravelSpeed(world),
            range: this.getRange(world),
        }
    }

    commands = (cmd, val) => {
        switch (cmd) {
            case "name":
                this.name = val;
                break;
            case "description":
                this.description = val;
                break;
            case "static":
                this.is_static = val;
                break;
            case "image":
                this.image = val;
                break;
            case "xy":
                this.x = val[0];
                this.y = val[1];
                break;
            case "x":
                this.x = val;
                break;
            case "y":
                this.y = val;
                break;
            case "orientation":
                this.orientation = val;
                break;
            case "player_controlled":
                this.player_controlled = val;
                break;
            case "sail_area":
                this.sail_area = val;
                break;
            case "weight_penalty":
                this.weight_penalty = val;
                break;
        }
    }

    getTravelSpeed = (world) => {
        return (this.is_static) ? 0 : Number(world.getWindSpeed() * (this.getPositionFactor(world) / 10) * this.sail_area * this.weight_penalty).toFixed(2);
    }

    getPositionFactor = (world) => {
        const position_factor = [0.0, 1.5, 3.0, 5.1, 6.9, 7.9, 8.0, 8.1, 8.0, 8.0, 8.0, 8.2, 8.4, 8.6, 8.0, 6.9, 5.9, 5.3, 5.1];
        var x = Math.round(Math.abs(this.orientation - world.getWindSource()) / 10);
        return (x >= 0 && x <= 18) ? position_factor[x] : 0;
    }

    getRange = (world) => {
        return (this.is_static) ? 0 : Number(this.getTravelSpeed(world) * 0.5).toFixed(2);
    }

}

class WeaponGroup {
    constructor() {
        this.id = 0;

        this.weapon_type = null;
        this.weapon_count = 0;
        this.ammunition_type = null;

        this.radius = 30;
        this.rotation_from_orientation = 0;
    }

    export = () => {
    }

    import = (data) => {
    }

    info = () => {
        return {
            id: this.id,
            weapon_type: this.weapon_type,
            weapon_count: this.weapon_count,
            ammunition_type: this.ammunition_type,
            radius: this.radius,
            rotation_from_orientation: this.rotation_from_orientation,
            range: [0, 0, 0], // TODO: Calculate
            damage: [0, 0, 0], // TODO: Calculate
        }
    }
}


module.exports = { SocketHandler, Dice, World, WorldItem, WeaponGroup }

