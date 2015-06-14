var PASS = "pass";
var FORWARD = "f";
var BACKWARD = "b";
var TURN_LEFT = "tl";
var TURN_RIGHT = "tr";
var STRAFE_LEFT = "l";
var STRAFE_RIGHT = "r";
var ATTACK_RANGED = "ranged_attack";
var HEAD = "h";

function main() {
    var timestep = 500;

    game_state = new game_state();
    player1 = new player(); player2 = new player();
    player1.units.push(new unit(3, 3)); player1.units.push(new unit(4, 4)); player1.units.push(new unit(5, 5));
    player2.units.push(new unit(17, 3)); player2.units.push(new unit(18, 4)); player2.units.push(new unit(19, 5));
    game_state.players.push(player1);
    game_state.players.push(player2);
    var initialState = get_game_state();

    var renderer = new PIXI.autoDetectRenderer(1600, 1600);

    $(window).resize(function(e) { renderer.view.style.width = $("#container").width() + "px"; });
    renderer.view.style.width = $("#container").width() + "px";

    $("#container").append(renderer.view);
    var stage = new PIXI.Container();

    // set up grid
    var gameGrid = new GameGrid(20, 20, renderer.width, renderer.height);
    stage.addChild(gameGrid.stage);
    gameGrid.copyTerrain(initialState.game_map.terrain);
    

    // set up players
    var playerTextures = [
        [
            PIXI.Texture.fromImage("img/a.png"),
            PIXI.Texture.fromImage("img/b.png"),
            PIXI.Texture.fromImage("img/c.png"),
        ],
        [
            PIXI.Texture.fromImage("img/d.png"),
            PIXI.Texture.fromImage("img/e.png"),
            PIXI.Texture.fromImage("img/f.png"),
        ],
    ];
    var characterSprites = initialState.players.map(function(player, i) {
        return player.units.map(function(character, j) {
            var sprite = new PIXI.Sprite(playerTextures[i][j]);
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.scale.x = 2; sprite.scale.y = 2;
            stage.addChild(sprite);
            return sprite;
        });
    });
    
    // mapping from players to the amount of time each one spent in the 
    var playerAnimationProgress = initialState.players.map(function(player, i) {
        return player.units.map(function(character, j) { return 0; });
    });
    
    function onTick(cellX, cellY) {
        // Call into the game logic
        game_state.update(); // call this every time you want a timer tick
        
        var state = get_game_state();
        state.players.forEach(function(player, i) {
            player.units.forEach(function(character, j) {
                if (character.previous_action == ATTACK_RANGED && character.current_cooldown == character.cooldowns[ATTACK_RANGED]) {
                    var rangedSprite = new PIXI.TilingSprite(PIXI.Texture.fromImage("img/ranged.png"), 128, 0);
                    rangedSprite.anchor.x = rangedSprite.anchor.y = 0.5;
                    stage.addChild(rangedSprite);
                    var hitSprite = new PIXI.Sprite(PIXI.Texture.fromImage("img/hit.png"));
                    hitSprite.anchor.x = hitSprite.anchor.y = 0.5;
                    stage.addChild(hitSprite);

                    var targetX = character.attack_target.x, targetY = character.attack_target.y;
                    if (targetX === character.x) {
                        rangedSprite.rotation = 0;
                        rangedSprite.height = (targetY - character.y) * cellY;
                    } else {
                        rangedSprite.rotation = Math.PI / 2;
                        rangedSprite.height = (targetX - character.x) * cellX;
                    }
                    rangedSprite.position.x = (character.x + 0.5 + (targetX - character.x) / 2) * cellX;
                    rangedSprite.position.y = (character.y + 0.5 + (targetY - character.y) / 2) * cellY;
                    
                    hitSprite.position.x = (targetX + 0.5) * cellX; hitSprite.position.y = (targetY + 0.5) * cellY;
                    hitSprite.width = hitSprite.height = cellX * 2;
                    animate(400, function(progress) { rangedSprite.alpha = hitSprite.alpha = 1 - progress; }, function() { stage.removeChild(rangedSprite); stage.removeChild(hitSprite); });
                }
            });
        });
    }
    
    var lastStep = Date.now();
    var accumulator = 0;
    function onStep() {
        var cellX = gameGrid.cellDimension("width"), cellY = gameGrid.cellDimension("height");
        
        var now = Date.now(); var dt = now - lastStep; lastStep = now;
        accumulator += dt;
        while (accumulator >= timestep) { onTick(cellX, cellY); accumulator -= timestep; }
        var state = get_game_state();
        
        // update movement animations for the characters
        var tickFraction = accumulator / timestep;
        
        // update player position and orientation
        state.players.forEach(function(player, i) {
            player.units.forEach(function(character, j) {
                var values = updateCharacter(cellX, cellY, character, i, j, tickFraction, stage);

                var sprite = characterSprites[i][j];
                sprite.position.x = (values.x + 0.5) * cellX; sprite.position.y = (values.y + 0.5) * cellY; sprite.rotation = values.angle * Math.PI / 180;
                sprite.width = sprite.height = cellX;
            });
        });

        gameGrid.update();

        stepAnimations(dt);
        
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

function updateCharacter(cellX, cellY, character, i, j, tickFraction, stage) {
    var x = character.x, y = character.y, angle = character.angle;
    console.log(character.previous_action)
    switch (character.previous_action) { // interpolate and predict the next player's position
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
    return {x: x, y: y, angle: angle};
}

// initialize animations
var animations = [];
function animate(duration, stepCallback, doneCallback) {
    animations.push({
        progress: 0,
        duration: duration,
        stepCallback: stepCallback || function(progress) {},
        doneCallback: doneCallback || function(progress) {},
    })
}
function stepAnimations(dt) {
    // process animations
    var completedAnimations = {};
    animations.forEach(function(animation, i) {
        animation.progress += dt / animation.duration;
        if (animation.progress >= 1) {
            completedAnimations[i] = true;
            animation.doneCallback();
        } else animation.stepCallback(animation.progress);
    });
    animations = animations.filter(function(animation, i) { return !completedAnimations.hasOwnProperty(i); })
}

$(main);
