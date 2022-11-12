'use strict'

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



module.exports = { WeaponGroup }