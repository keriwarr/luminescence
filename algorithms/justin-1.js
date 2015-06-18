return function(unit, state, valid_actions) {
    var enemies_left = state.players[1].units.filter(function (x) {return x.health > 0;});

    function distance_to_enemy(enemy){
        var xdis = Math.abs(unit.x - enemy.x);
        var ydis = Math.abs(unit.y - enemy.y);
        return xdis + ydis;
    }

    // Shoot if enemy target in sight
    var attack_target = unit.acquire_target(state);
    var unit_to_attack = state.get_unit_in_tile(attack_target.x, attack_target.y);
    if (unit_to_attack !== null && enemies_left.indexOf(unit_to_attack) > -1) {
        return "ranged_attack";
    }

    // Move towards nearest enemy
    if (enemies_left.length === 0)
        return "pass";
    var closest_enemy = enemies_left.sort(function (a, b) { return distance_to_enemy(a) - distance_to_enemy(b); })[0];

    var x_displacement = unit.x - closest_enemy.x;
    var y_displacement = unit.y - closest_enemy.y;

    var to_the_west = x_displacement > 0;
    var same_column = x_displacement === 0;
    var to_the_north = y_displacement > 0;
    var same_row = y_displacement === 0;

    if (same_column) {
        if (unit.angle === 0)
            if(to_the_north)
                return "forward";
            else {
                return "turn_right";
            }
        else if (unit.angle == 90)
            if(to_the_north)
                return "turn_left";
            else
                return "turn_right";
        else if (unit.angle == 180)
            if(to_the_north)
                return "turn_right";
            else
                return "forward";
        else
            if(to_the_north)
                return "turn_right";
            else
                return "turn_left";
    }
    else if (same_row) {
        if (unit.angle === 0)
            if(to_the_west)
                return "turn_left";
            else
                return "turn_right";
        else if (unit.angle == 90)
            if(to_the_west)
                return "turn_left";
            else
                return "forward";
        else if (unit.angle == 180)
            if(to_the_west)
                return "turn_right";
            else
                return "turn_left";
        else
            if(to_the_west)
                return "forward";
            else
                return "turn_left";
    }
    else { // Move closer to their row or column
        var direction = (Math.random() > 0.5) ? "east-west" : "north-south";
        if (direction == "east-west") {
            if (to_the_west) {
                if (unit.angle === 0)
                    return "turn_left";
                else if (unit.angle == 90)
                    return "turn_left";
                else if (unit.angle == 180)
                    return "turn_right";
                else
                    return "forward";
            }
            else {
                if (unit.angle === 0)
                    return "turn_right";
                else if (unit.angle == 90)
                    return "forward";
                else if (unit.angle == 180)
                    return "turn_left";
                else
                    return "turn_right";
            }
        }
        else {
            if (to_the_north) {
                if (unit.angle === 0)
                    return "forward";
                else if (unit.angle == 90)
                    return "turn_left";
                else if (unit.angle == 180)
                    return "turn_right";
                else
                    return "turn_right";
            }
            else {
                if (unit.angle === 0)
                    return "turn_right";
                else if (unit.angle == 90)
                    return "turn_right";
                else if (unit.angle == 180)
                    return "forward";
                else
                    return "turn_left";
            }
        }
    }
}       
