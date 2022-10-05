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
        this.wind_source = 45; // Windrichtung in grad (0-360), 0 = Norden WINDQUELLE
        this.beauford_value = 4; // Borfor Scala 1-12 
    }

    export = () => {
        return [this.wind_source, this.beauford_value];
    }

    import = (data) => {
        this.wind_source = data[0];
        this.beauford_value = data[1];
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

    constructor(id, name, is_static, image) {
        this.id = id;        // ID
        this.is_static = is_static; // Beweglich oder nicht
        this.name = name;   // Name
        this.description = "";  // Beschreibung
        this.image = image; // Bild
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
        return [this.id, this.is_static, this.name, this.description, this.image, this.x, this.y, this.orientation, this.player_controlled, this.sail_area, this.position_factor, this.weight_penalty];
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
            position_factor: this.position_factor,
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
            case "position_factor":
                this.position_factor = val;
                break;
            case "weight_penalty":
                this.weight_penalty = val;
                break;
        }
    }

    getTravelSpeed = (world) => {
        return Number(world.getWindSpeed() * (this.getPositionFactor(world) / 10) * this.sail_area * this.weight_penalty).toFixed(2);
    }

    getPositionFactor = (world) => {
        const position_factor = [0.0, 1.5, 3.0, 5.1, 6.9, 7.9, 8.0, 8.1, 8.0, 8.0, 8.0, 8.2, 8.4, 8.6, 8.0, 6.9, 5.9, 5.3, 5.1];
        var x = Math.round(Math.abs(this.orientation - world.getWindSource()) / 10);
        return (x >= 0 && x <= 18) ? position_factor[x] : 0;
    }

    getRange = (world) => {
        return Number(this.getTravelSpeed(world) * 0.5).toFixed(2);
    }

}

module.exports = { World, WorldItem }

