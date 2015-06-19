// global variables

var valid_actions = [
    'forward',
    'backward',
    'turn_left',
    'turn_right',
    'strafe_left',
    'strafe_right',
    'ranged_attack',
    'pass',
]

var default_health = 20;

var default_cooldowns = {
    'ranged_attack': 15,
    'move_normal':   8,
    'move_slow':     12,
    'turn':          10,
};

var default_attributes = {
    'damage': 5
}

function Map(cols, rows) {
    this.terrain = [];
    this.rows = rows;
    this.cols = cols;
    this.terrain = [
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
    ];
}

function State(cols, rows) {
    cols = cols || 20; rows = rows || 20;
    this.players = [];
    this.map = new Map(cols, rows);
}

State.prototype.update = function State_update() {
    this.players.forEach(function(player) {
        player.units.forEach(function(unit) {
            unit.just_died = false;
            if (unit.health > 0) {
                if (unit.current_cooldown == 0) {
                    unit.execute_action();
                } else {
                    unit.current_cooldown --;
                }
            }
        });
    });
}

State.prototype.is_tile_pathable = function(x, y) {
    if (x < 0 || x >= this.map.cols){
        return false;
    } else if (y < 0 || y >= this.map.cols){
        return false;
    }

    if (this.map.terrain[x][y] != 0) {
        return false;
    }

    for (var i = 0; i < this.players.length; i ++) {
        var units = this.players[i].units;
        for (var j = 0; j < units.length; j ++) {
            var unit = units[j];
            if (unit.x == x && unit.y == y && unit.health > 0) {
                return false;
            }
        }
    }
    return true;
}

State.prototype.get_unit_in_tile = function(x, y) {
    for (var i = 0; i < this.players.length; i ++) {
        var units = this.players[i].units;
        for (var j = 0; j < units.length; j ++) {
            var unit = units[j];
            if (unit.x == x && unit.y == y && unit.health > 0) {
                return unit;
            }
        }
    }
    return null;
}

// player stuff

function Player() {
    this.units = [];
}

function Unit(state, x, y, choose_action) {
    this.state = state;
    this.x = x;
    this.y = y;
    this.angle = 0; // degrees. 0 <= angle <= 360, with 0 being straight up

    this.choose_action = choose_action;

    this.max_health = default_health;
    this.health = default_health;

    this.attrs = default_attributes;
    this.cooldowns = default_cooldowns;

    this.attack_target = null;

    this.previous_action = 'pass';
    this.just_died = false;

    this.current_cooldown = 0;
}

Unit.prototype.execute_action = function () {
    var actionChoice = this.choose_action(this, this.state, valid_actions); // this would be given by the user's fn
    this.attack_target = null;

    // check if the action is valid
    switch(actionChoice) {
        case 'forward':
            if (!this.can_move(this.angle)) {
                actionChoice = 'pass';
            }
            break;
        case 'strafe_right':
            if (!this.can_move(this.angle + 90)) {
                actionChoice = 'pass';
            }
            break;
        case 'backward':
            if (!this.can_move(this.angle + 180)) {
                actionChoice = 'pass';
            }
            break;
        case 'strafe_left':
            if (!this.can_move(this.angle + 270)) {
                actionChoice = 'pass';
            }
            break;
    }

    // execute the action
    switch(actionChoice) {
        case 'pass':
            break;
        case 'forward':
            this.move(this.angle, 'normal');
            break;
        case 'strafe_right':
            this.move(this.angle + 90, 'slow');
            break;
        case 'backward':
            this.move(this.angle + 180, 'slow');
            break;
        case 'strafe_left':
            this.move(this.angle + 270, 'slow');
            break;
        case 'turn_right':
            this.turn(90);
            break;
        case 'turn_left':
            this.turn(270);
            break;
        case 'ranged_attack':
            this.attack_target = this.acquire_target();
            var targetUnit = this.get_unit_in_tile(this.attack_target.x, this.attack_target.y);
            if (targetUnit !== null) {
                targetUnit.health -= this.attrs['damage']; // if nothing to attack, just attack the wall
                if (targetUnit.health <= 0)
                    targetUnit.just_died = true;
            }
            this.current_cooldown = this.cooldowns['ranged_attack'];
            break;
        case 'heal':
            break;
    }

    this.previous_action = actionChoice;
}

Unit.prototype.acquire_target = function() {
    target_x = this.x + getX(this.angle), target_y = this.y + getY(this.angle);
    while (this.is_tile_pathable(target_x, target_y)) {
        target_x += getX(this.angle); target_y += getY(this.angle);
    }
    return {x: target_x, y: target_y}
}

Unit.prototype.move = function (move_direction, move_speed) {
    this.x += getX(move_direction); this.y += getY(move_direction);

    if (move_speed == 'normal') {
        this.current_cooldown = this.cooldowns['move_normal'];
    } else if (move_speed == 'slow') {
        this.current_cooldown = this.cooldowns['move_slow'];
    }
}


Unit.prototype.turn = function (turn_direction) {
    this.angle = (this.angle + turn_direction) % 360; if (this.angle < 0) this.angle += 360;
    this.current_cooldown = default_cooldowns['turn']
}

// The API functions we expose to the user. The user CANNOT use anything not written here.

Unit.prototype.get_map = function get_map() {
    return this.state.map.terrain;
}

Unit.prototype.get_nearest_ally = function get_nearest_ally() {
    //not implemented
}

Unit.prototype.get_nearest_enemy = function get_nearest_enemy() {
    //not implemented
}

Unit.prototype.get_unit_in_sight = function get_unit_in_sight() {
    x = this.acquire_target(this.state)[x];
    y = this.acquire_target(this.state)[y];

    if (this.get_map().terrain[x][y] == 1) {
        return 'wall'
    }

    for (var i = 0; i < this.state.players.length; i++) {
        for (var j = 0; j < this.state.players[i].units.length; j++) {
            unit = this.state.players[i].units[j];
            if (unit.x == x && unit.y == y) {
                if (i == 0) {
                    return 'p1unit'
                } else {
                    return 'p2unit'
                }
            }
        }
    }
    return null; //should never reach here...
}

Unit.prototype.get_unit_list = function get_unit_list() {
    unit_list = [];

    for (var i = 0; i < this.state.players.length; i++) {
        for (var j = 0; j < this.state.players[i].units.length; j++) {
            unit = this.state.players[i].units[j];
            if (unit.health > 0) {
                unit_list.push({'player': i, 'unit': unit});
            }
        }
    }

    return unit_list;
}

Unit.prototype.can_move = function(move_direction) {
    move_direction = move_direction % 360; if (move_direction < 0) move_direction += 360;

    switch (move_direction) {
        case 0: return (this.y > 0) && (this.state.map.terrain[this.x][this.y-1] == 0)
        case 90: return (this.x < this.state.map.cols-1) && (this.state.map.terrain[this.x+1][this.y] == 0)
        case 180: return (this.y < this.state.map.rows-1) && (this.state.map.terrain[this.x][this.y+1] == 0)
        case 270: return (this.x > 0) && (this.state.map.terrain[this.x-1][this.y] == 0)
    }
}

Unit.prototype.is_tile_pathable = function (x, y) {
    return this.state.is_tile_pathable(x, y);
}

Unit.prototype.get_unit_in_tile = function(x, y) {
    return this.state.get_unit_in_tile(x, y);
}

Unit.prototype.get_valid_actions = function() {
    return valid_actions;
}

Unit.prototype.get_cooldowns = function() {
    return this.cooldowns;
}

Unit.prototype.get_attributes = function() {
    return this.attrs;
}

Unit.prototype.get_info = function() {
    return this;
}

// An example function - this is what the function the user writes, calling our API, would look like

Unit.prototype.choose_action = function choose_action(unit, state, valid_actions) {
    // attempt to move toward advantagous position, when strafing into the path of en enemy from behind
    var target_x = this.x + getX(this.angle) + getY(this.angle), target_y = this.y + getY(this.angle) - getX(this.angle);
    while (this.is_tile_pathable(target_x, target_y))
        target_x += getX(this.angle); target_y += getY(this.angle);
    var targetUnit = this.get_unit_in_tile(target_x, target_y);
    if (targetUnit !== null && getX(targetUnit.angle) == getX(this.angle) && getY(targetUnit.angle) == getY(this.angle))
        return "strafe_right"; // unit is facing away from the player, and we can strafe in immediately
    var target_x = this.x + getX(this.angle) - getY(this.angle), target_y = this.y + getY(this.angle) + getX(this.angle);
    while (this.is_tile_pathable(target_x, target_y))
        target_x += getX(this.angle); target_y += getY(this.angle);
    var targetUnit = this.get_unit_in_tile(target_x, target_y);
    if (targetUnit !== null && getX(targetUnit.angle) == getX(this.angle) && getY(targetUnit.angle) == getY(this.angle))
        return "strafe_left"; // unit is facing away from the player, and we can strafe in immediately

    // attack enemy in line of sight
    var attack_target = this.acquire_target();
    var targetUnit = this.get_unit_in_tile(attack_target.x, attack_target.y);
    if (targetUnit !== null) {
        return "ranged_attack";
    }

    return valid_actions[Math.floor(Math.random() * valid_actions.length)];
}

// The API functions we expose to the user

function getX(angle) {
    angle = angle % 360; if (angle < 0) angle += 360;
    return angle === 90 ? 1 : angle == 270 ? -1 : 0;
}
function getY(angle) {
    angle = angle % 360; if (angle < 0) angle += 360;
    return angle === 0 ? -1 : angle == 180 ? 1 : 0;
}

//NOT IMPLEMENTED
