'use strict'

const { WeaponGroup } = require('./weapon_group.js');
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


module.exports = { WorldItem }