// global variables

var valid_actions = [
    'forward',
    'backward',
    'turn_left',
    'turn_right',
    'strafe_left',
    'strafe_right',
    'ranged_attack',
    'pass'
]

var default_health = 20;
var default_rows = 20;
var default_cols = 20;

var default_cooldowns = {
    'ranged_attack' : 15,
    'move_normal' : 8,
    'move_slow' : 12,
    'turn' : 10
};

var default_attributes = {
    'damage': 5
}

// map stuff

var game_map = function game_map(cols, rows) {
    this.terrain = [];
    this.rows = rows;
    this.cols = cols;

    // this.terrain = [
    //     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //     [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    //     [0,0,0,1,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    //     [0,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0],
    //     [0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,1,0,0,0,0,0,1,1,0,0,0],
    //     [0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,0,0,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,0,1,1,1,1,0,0,0,1,0,0,0,0,0,1,1,0,0,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,0,0,0],
    //     [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    //     [0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,0,0,1,1,0,0,0,0,0,1,0,0,0,1,1,1,1,0,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0],
    //     [0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0],
    //     [0,0,0,1,1,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0],
    //     [0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0],
    //     [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,1,0,0,0],
    //     [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    //     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    // ];
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
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0]
    ]

    // for (var i = 0; i < cols; i++) {
    //     col = [];
    //     for (var j = 0; j < rows; j++) {
    //         col.push(0);
    //     }
    //     this.terrain.push(col);
    // }
}

// game state stuff

var game_state = function game_state(cols, rows) {
    this.players = [];
    this.game_map = new game_map(cols || default_cols, rows || default_rows);
}

game_state.prototype.get_player = function (index)  {
    return this.players[index];
}

game_state.prototype.update = function () {
    for (var i = 0; i < this.players.length; i++) {
        for (var j = 0; j < this.players[i].units.length; j++) {
            unit = this.players[i].units[j];
            if (unit.just_died) unit.just_died = false;
            if (unit.health <= 0) continue;
            if (unit.current_cooldown == 0) {
                unit.execute_action(this);
            }
            else
            {
                unit.current_cooldown--;
            }
        }
    } 
}

game_state.prototype.is_tile_pathable = function(x, y) {
    if (x < 0 || x >= this.game_map.cols){
        return false;
    } else if (y < 0 || y >= this.game_map.cols){
        return false;
    }

    if (this.game_map.terrain[x][y] != 0) {
        return false;
    }

    for (var i = 0; i < this.players.length; i++) {
        for (var j = 0; j < this.players[i].units.length; j++) {
            unit = this.players[i].units[j];
            if (unit.x == x && unit.y == y && unit.health > 0) {
                return false;
            }
        }
    }

    return true;
}

game_state.prototype.get_unit_in_tile = function(x, y) {
    for (var i = 0; i < this.players.length; i++) {
        for (var j = 0; j < this.players[i].units.length; j++) {
            unit = this.players[i].units[j];
            if (unit.x == x && unit.y == y && unit.health > 0) {
                return unit;
            }
        }
    }
    return null;
}

// player stuff

var player = function player() {
    this.units = [];
}

player.prototype.get_unit = function (index) {
    return this.units[index];
}

// unit stuff

var unit = function unit(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0; // degrees. 0 <= angle <= 360, with 0 being straight up

    this.max_health = default_health;
    this.health = default_health;

    this.attrs = default_attributes;
    this.cooldowns = default_cooldowns;

    this.attack_target = null;

    this.previous_action = 'pass';
    this.just_died = false;

    this.current_cooldown = 0;
    cooldowns = default_cooldowns;
}

unit.prototype.execute_action = function (game_state) {
    action_choice = this.choose_action(game_state); // this would be given by the user's fn
    this.attack_target = null;

    switch(action_choice) {
        case 'forward':
            if (!this.can_move(this.angle, game_state.game_map)) {
                action_choice = 'pass';
            }
            break;
        case 'strafe_right':
            if (!this.can_move(this.angle + 90, game_state.game_map)) {
                action_choice = 'pass';
            }
            break;
        case 'backward':
            if (!this.can_move(this.angle + 180, game_state.game_map)) {
                action_choice = 'pass';
            }
            break;
        case 'strafe_left':
            if (!this.can_move(this.angle + 270, game_state.game_map)) {
                action_choice = 'pass';
            }
            break;
    }

    switch(action_choice) {
        case 'pass':
            break;
        case 'forward':
            this.move(this.angle, 'normal', game_state.game_map);
            break;
        case 'strafe_right':
            this.move(this.angle + 90, 'slow', game_state.game_map);
            break;
        case 'backward':
            this.move(this.angle + 180, 'slow', game_state.game_map);
            break;
        case 'strafe_left':
            this.move(this.angle + 270, 'slow', game_state.game_map);
            break;
        case 'turn_right':
            this.turn(90);
            break;
        case 'turn_left':
            this.turn(270);
            break;
        case 'ranged_attack':
            this.attack_target = this.acquire_target(game_state);
            var unit_to_attack = game_state.get_unit_in_tile(this.attack_target.x, this.attack_target.y);
            if (unit_to_attack !== null) {
                unit_to_attack.health -= this.attrs['damage']; // if nothing to attack, just attack the wall
                if (unit_to_attack.health <= 0)
                    unit_to_attack.just_died = true;
            }
            this.current_cooldown = this.cooldowns['ranged_attack'];
            break;
        case 'heal':
            break;
    }

    this.previous_action = action_choice;
}

unit.prototype.acquire_target = function(game_state) {
    var target_y = this.y;
    var target_x = this.x;

    switch (this.angle) {
        case 0:
            target_y--;
            break;
        case 90:
            target_x++;
            break;
        case 180:
            target_y++;
            break;
        case 270:
            target_x--;
            break;
    }

    while (game_state.is_tile_pathable(target_x, target_y)) {

        switch (this.angle) {
            case 0:
                target_y--;
                break;
            case 90:
                target_x++;
                break;
            case 180:
                target_y++;
                break;
            case 270:
                target_x--;
                break;
        }

    } 

    return {x: target_x, y: target_y}
}

unit.prototype.move = function (move_direction, move_speed, game_map) {
    move_direction = move_direction % 360; if (move_direction < 0) move_direction += 360;

    switch(move_direction) {
        case 0:
            this.y--;
            break;
        case 90:
            this.x++;
            break;
        case 180:
            this.y++;
            break;
        case 270:
            this.x--;
            break;
    }

    if (move_speed == 'normal') {
        this.current_cooldown = this.cooldowns['move_normal'];
    } else if (move_speed == 'slow') {
        this.current_cooldown = this.cooldowns['move_slow'];
    }
}

unit.prototype.can_move = function(move_direction, game_map) {
    move_direction = move_direction % 360; if (move_direction < 0) move_direction += 360;

    switch (move_direction) {
        case 0:
            return (this.y > 0) && (game_map.terrain[this.x][this.y-1] == 0)
        case 90:
            return (this.x < game_map.cols-1) && (game_map.terrain[this.x+1][this.y] == 0)
        case 180:
            return (this.y < game_map.rows-1) && (game_map.terrain[this.x][this.y+1] == 0)
        case 270:
            return (this.x > 0) && (game_map.terrain[this.x-1][this.y] == 0)
    }
}

unit.prototype.turn = function (turn_direction) {
    this.angle = (this.angle + turn_direction) % 360; if (this.angle < 0) this.angle += 360;
    this.current_cooldown = default_cooldowns['turn']
}

function get_game_state() {
    return game_state;
}

// An example function - this is what the function the user writes, calling our API, would look like

unit.prototype.choose_action = function choose_action(game_state) {
    var attack_target = this.acquire_target(game_state);
    var unit_to_attack = game_state.get_unit_in_tile(attack_target.x, attack_target.y);
    if (unit_to_attack !== null) { return "ranged_attack"; }

    return valid_actions[Math.floor(Math.random() * valid_actions.length)];
}

// The API functions we expose to the user

//NOT IMPLEMENTED
