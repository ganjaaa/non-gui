'use strict'

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
        this.oid = 0;
        this.tick = 1;
        this.tick_sec = 0;
        this.wind_source = 45; // Windrichtung in grad (0-360), 0 = Norden WINDQUELLE
        this.beauford_value = 4; // Borfor Scala 1-12 
    }

    export = () => {
        return [this.oid, this.tick, this.tick_sec, this.wind_source, this.beauford_value];
    }

    import = (data) => {
        this.oid = data[0];
        this.tick = data[1];
        this.tick_sec = data[2];
        this.wind_source = data[3];
        this.beauford_value = data[4];
    }

    info = () => {
        return {
            current_tick: this.tick,
            current_tick_sec: this.tick_sec,
            wind_source: this.wind_source,
            beauford_value: this.beauford_value,
            weather_description: beauford_scale[this.beauford_value][0],
            wind_speed: beauford_scale[this.beauford_value][1],
            wave_height: beauford_scale[this.beauford_value][2],
        }
    }

    commands = (cmd, val) => {
        if (cmd == "tick") {
            this.tick = val;
        }        
        if (cmd == "tick_sec") {
            this.tick_sec = val;
        }
        if (cmd == "wind_source") {
            this.wind_source = val;
        }
        if (cmd == "beauford_value") {
            this.beauford_value = val;
        }
        return null;
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

}


module.exports = { World }