'use strict'

const { WorldItem } = require('./world_item.js');

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

class World {
    constructor() {
        this.edit_mode = false;
        //
        this.oid = 0;
        this.tick = 1;
        this.tick_sec = 0;
        this.wind_source = 45; // Windrichtung in grad (0-360), 0 = Norden WINDQUELLE
        this.beauford_value = 4; // Borfor Scala 1-12 
        // 
        this.objects = [];
        this.objects_map = {};
    }

    export = () => {
        var data = {
            world: [this.oid, this.tick, this.tick_sec, this.wind_source, this.beauford_value],
            objects: []
        };
        for (var i = 0; i < this.objects.length; i++) {
            data.objects.push(this.objects[i].export());
        }
        return data;
    }

    import = (data) => {
        this.oid = data.world[0];
        this.tick = data.world[1];
        this.tick_sec = data.world[2];
        this.wind_source = data.world[3];
        this.beauford_value = data.world[4];

        this.objects = [];
        for (var i = 0; i < data.objects.length; i++) {
            this.objects.push(new WorldItem(data.objects[i][0]));
            this.objects[i].import(data.objects[i]);
        }
        this.update_objects_map();
    }

    info = () => {
        var data = {
            edit_mode: this.edit_mode,
            world: {
                current_tick: this.tick,
                current_tick_sec: this.tick_sec,
                wind_source: this.wind_source,
                beauford_value: this.beauford_value,
                weather_description: beauford_scale[this.beauford_value][0],
                wind_speed: beauford_scale[this.beauford_value][1],
                wave_height: beauford_scale[this.beauford_value][2],
            },
            objects: []
        };
        for (var i = 0; i < this.objects.length; i++) {
            data.objects.push(this.objects[i].info(this));
        }
        return data;
    }

    commands = (cmd, val) => {
        if (cmd == "edit_mode") {
            this.edit_mode = val;
            return null;
        }
        if (cmd == "tick") {
            this.tick = val;
            return null;
        }
        if (cmd == "tick_sec") {
            this.tick_sec = val;
            return null;
        }
        if (cmd == "wind_source") {
            this.wind_source = val;
            return null;
        }
        if (cmd == "beauford_value") {
            this.beauford_value = val;
            return null;
        }
        if (cmd == "add_item") {
            return ["world", "add_item", this.addWorldItem()];
        }
        if (cmd == "del_item") {
            this.removeWorldItem(val);
            return null;
        }
        return null;
    }

    itemCommand = (id, cmd, val) => {
        var obj = this.getWorldItem(id);
        if (obj !== null) {
            obj.commands(cmd, val);
        }
    }

    getNextId = () => {
        this.oid++;
        return this.oid;
    }

    incTick = () => {
        this.tick++;
    }

    getTick = () => {
        return this.tick;
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

    addWorldItem = () => {
        var newId = this.getNextId();
        this.objects.push(new WorldItem(newId));
        this.update_objects_map();
        return newId;
    }

    getWorldItem = (id) => {
        if (this.objects_map.hasOwnProperty(id)) {
            return this.objects[this.objects_map[id]];
        }
        return null;
    }

    removeWorldItem = (id) => {
        if (this.objects_map.hasOwnProperty(id)) {
            this.objects.splice(this.objects_map[id], 1);
        }
        this.update_objects_map();
    }

    update_objects_map = () => {
        this.objects_map = {};
        for (var i = 0; i < this.objects.length; i++) {
            this.objects_map[this.objects[i].id] = this.objects[i];
        }
    }

}


module.exports = { World }