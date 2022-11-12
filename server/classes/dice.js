'use strict'

const crypto = require('crypto');

class Dice {
    /**
     * Class Commands from Websocket
     * 
     * @param {string} cmd 
     * @param {string} val 
     * @returns {array, null}
     */
    commands = (cmd, val) => {
        if (cmd == "roll") {
            return ["dice", "roll", this.calculate(val)];
        }
        if (cmd == "min") {
            return ["dice", "min", this.calculateMin(val)];
        }
        if (cmd == "max") {
            return ["dice", "max", this.calculateMax(val)];
        }
        return null;
    }

    /**
     * Get a Random Nummber between min and max
     * 
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    getRandom = (min, max) => {
        return (min === max) ? min : crypto.randomInt(min, max + 1);
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
            if (dice_parts[p].indexOf('d') > -1) {
                var dice = dice_parts[p].split("d");
                result += parseInt(dice[0]);
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
            if (dice_parts[p].indexOf('d') > -1) {
                var dice = dice_parts[p].split("d");
                for (var i = 0; i < dice[0]; i++) {
                    result += this.getRandom(1, parseInt(dice[1]));
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
            if (dice_parts[p].indexOf('d') > -1) {
                var dice = dice_parts[p].split("d");
                for (var i = 0; i < dice[0]; i++) {
                    result += parseInt(dice[1]);
                }
            } else {
                result += parseInt(dice_parts[p]);
            }
        }
        return result;
    }
}

module.exports = { Dice }