var FORWARD = "f";
var BACKWARD = "b";
var TURN_LEFT = "tl";
var TURN_RIGHT = "tr";
var STRAFE_LEFT = "l";
var STRAFE_RIGHT = "r";
var ATTACK = "a";
var HEAD = "h";
var state = {
    players: [
        {
            characters: [
                {
                    x: 1, y: 1, angle: 90,
                    forward_cooldown: 2, // tick counts
                    move_cooldown: 8,
                    turn_cooldown: 2,
                    attack_cooldown: 15,
                    heal_cooldown: 20,
                    current_cooldown: 0,
                    current_action: FORWARD,
                },
                {
                    x: 1, y: 3, angle: 0,
                    forward_cooldown: 4,
                    move_cooldown: 8,
                    turn_cooldown: 2,
                    attack_cooldown: 15,
                    heal_cooldown: 20,
                    current_cooldown: 0,
                    current_action: BACKWARD,
                },
                {
                    x: 1, y: 5, angle: 270,
                    forward_cooldown: 4,
                    move_cooldown: 8,
                    turn_cooldown: 2,
                    attack_cooldown: 15,
                    defend_cooldown: 25,
                    heal_cooldown: 20,
                    current_cooldown: 0,
                    current_action: TURN_LEFT,
                },
            ],
        },
    ],
    global_speed: 2, // ticks per second
    terrain: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0],
        [0,0,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,0,0],
        [0,0,1,1,1,1,0,0,0,1,1,0,0,0,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,0,0,0,1,1,0,0,0,1,1,1,1,0,0],
        [0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,1,1,1,0,0],
        [0,0,1,1,0,0,0,1,1,1,1,1,1,0,0,0,1,1,0,0],
        [0,0,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
};

function main() {
    var timestep = 500;

    var renderer = new PIXI.autoDetectRenderer($(document).width(), $(document).height());

    $(window).resize(function(e) {
        renderer.view.style.width = $("#container").width();
        renderer.view.style.height = $("#container").height();
    });

    $("#container").append(renderer.view);
    var stage = new PIXI.Container();

    // set up grid
    var gameGrid = new GameGrid(20, 20, renderer.width, renderer.height);
    stage.addChild(gameGrid.stage);
    gameGrid.copyTerrain(state.terrain);

    // set up players
    var playerTexture = PIXI.Texture.fromImage("img/test.png");
    var characterSprites = state.players.map(function(player, i) {
        return player.characters.map(function(character, j) {
            var sprite = new PIXI.Sprite(playerTexture);
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.scale.x = 2; sprite.scale.y = 2;
            stage.addChild(sprite);
            return sprite;
        });
    });
    
    // mapping from players to the amount of time each one spent in the 
    var playerAnimationProgress = state.players.map(function(player, i) {
        return player.characters.map(function(character, j) { return 0; });
    });
    
    function onTick() {
        // Call into the game logic
        //wip
    }
    
    var lastStep = Date.now();
    var accumulator = 0;
    function onStep() {
        var now = Date.now(); var dt = now - lastStep; lastStep = now;
        accumulator += dt;
        while (accumulator >= timestep) { onTick(); accumulator -= timestep; }
        
        // update movement animations for the characters
        var tickFraction = accumulator / timestep;
        var cellX = gameGrid.cellDimension("width"), cellY = gameGrid.cellDimension("height");
        
        // update player position and orientation
        state.players.forEach(function(player, i) {
            player.characters.forEach(function(character, j) {
                var x = character.x, y = character.y, angle = character.angle;
                switch (character.current_action) { // interpolate and predict the next player's position
                    case FORWARD:
                        var actionElapsedTicks = (character.forward_cooldown - character.current_cooldown) + tickFraction;
                        var progress = actionElapsedTicks / character.forward_cooldown;
                        var nextX = character.x + getX(character.angle), nextY = character.y + getY(character.angle);
                        x += (nextX - character.x) * progress; y += (nextY - character.y) * progress;
                        break;
                    case BACKWARD:
                        var actionElapsedTicks = (character.move_cooldown - character.current_cooldown) + tickFraction;
                        var progress = actionElapsedTicks / character.move_cooldown;
                        var nextX = character.x - getX(character.angle), nextY = character.y - getY(character.angle);
                        x += (nextX - character.x) * progress; y += (nextY - character.y) * progress;
                        break;
                    case STRAFE_LEFT:
                        var actionElapsedTicks = (character.move_cooldown - character.current_cooldown) + tickFraction;
                        var progress = actionElapsedTicks / character.move_cooldown;
                        var nextX = character.x + getY(character.angle), nextY = character.y - getX(character.angle);
                        x += (nextX - character.x) * progress; y += (nextY - character.y) * progress;
                        break;
                    case STRAFE_RIGHT:
                        var actionElapsedTicks = (character.move_cooldown - character.current_cooldown) + tickFraction;
                        var progress = actionElapsedTicks / character.move_cooldown;
                        var nextX = character.x - getY(character.angle), nextY = character.y + getX(character.angle);
                        x += (nextX - character.x) * progress; y += (nextY - character.y) * progress;
                        break;
                    case TURN_LEFT: case TURN_RIGHT:
                        var actionElapsedTicks = (character.turn_cooldown - character.current_cooldown) + tickFraction;
                        var progress = actionElapsedTicks / character.turn_cooldown;
                        var nextAngle = character.angle + (character.current_action === TURN_LEFT ? -90 : 90)
                        angle += (nextAngle - character.angle) * progress;
                        break;
                }

                var sprite = characterSprites[i][j];
                sprite.position.x = (x - 0.5) * cellX; sprite.position.y = (y - 0.5) * cellY; sprite.rotation = angle * Math.PI / 180;
                sprite.width = sprite.height = cellX;
            });
        });

        gameGrid.update();
        renderer.render(stage);
        requestAnimationFrame(onStep);
    }
    requestAnimationFrame(onStep);
}

function getX(angle) {
    angle = angle % 360; if (angle < 0) angle += 360;
    return angle === 90 ? 1 : angle == 270 ? -1 : 0;
}
function getY(angle) {
    angle = angle % 360; if (angle < 0) angle += 360;
    return angle === 0 ? -1 : angle == 180 ? 1 : 0;
}

$(main);
