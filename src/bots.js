var PASS = "pass";
var FORWARD = "forward";
var BACKWARD = "backward";
var TURN_LEFT = "turn_left";
var TURN_RIGHT = "turn_right";
var STRAFE_LEFT = "strafe_left";
var STRAFE_RIGHT = "strafe_right";
var ATTACK_RANGED = "ranged_attack";
var HEAL = "heal";

var COLS = 24, ROWS = 24;

function main() {
    var timestep = 25;

    game_state = new game_state(COLS, ROWS);
    player1 = new player(); player2 = new player();
    player1.units.push(new unit(1, 3)); player1.units.push(new unit(12, 17)); player1.units.push(new unit(23, 23));
    player2.units.push(new unit(5, 1)); player2.units.push(new unit(17, 12)); player2.units.push(new unit(22, 10));
    game_state.players.push(player1);
    game_state.players.push(player2);
    var initialState = get_game_state();

    var renderer = new PIXI.autoDetectRenderer(1600, 1600);

    $(window).resize(function(e) {
        renderer.view.style.width = Math.min($("#container").width(), window.innerHeight) + "px";
    });
    renderer.view.style.width = Math.min($("#container").width(), window.innerHeight) + "px";

    $("#container").append(renderer.view);
    var stage = new PIXI.Container();

    // set up grid
    var gameGrid = new GameGrid(COLS, ROWS, renderer.width, renderer.height);
    stage.addChild(gameGrid.stage);
    gameGrid.copyTerrain(initialState.game_map.terrain);
    

    // set up players
    var playerTextures = [
        [
            PIXI.Texture.fromImage("img/a.png"),
            PIXI.Texture.fromImage("img/a.png"),
            PIXI.Texture.fromImage("img/a.png"),
        ],
        [
            PIXI.Texture.fromImage("img/c.png"),
            PIXI.Texture.fromImage("img/c.png"),
            PIXI.Texture.fromImage("img/c.png"),
        ],
    ];

    var healthBarTexture = PIXI.Texture.fromImage("img/health.png");

    var characterSprites = initialState.players.map(function(player, i) {
        return player.units.map(function(character, j) {
            var sprite = new PIXI.Sprite(playerTextures[i][j]);
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.scale.x = 2; sprite.scale.y = 2;
            stage.addChild(sprite);
            return sprite;
        });
    });

    var characterHealthBars = initialState.players.map(function(player, i) {
        return player.units.map(function(character, j) {
            var sprite = new PIXI.Sprite(healthBarTexture);
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
                console.log(character.just_died);
                if (character.just_died == true) {
                    var deathSprite = new PIXI.Sprite(PIXI.Texture.fromImage("img/hit1.png"));
                    deathSprite.anchor.x = deathSprite.anchor.y = 0.5;
                    deathSprite.scale.x = deathSprite.scale.y = 5;
                    stage.addChild(deathSprite);

                    deathSprite.position.x = (character.x + 0.5) * cellX; deathSprite.position.y = (character.y + 0.5) * cellY;
                    deathSprite.width = deathSprite.height = cellX * 2;
                    animate(2000, function(progress) { deathSprite.alpha = 1 - progress; }, function() { stage.removeChild(deathSprite); });

                }
                if (character.health <= 0) return;
                if (character.previous_action == ATTACK_RANGED && character.current_cooldown == character.cooldowns[ATTACK_RANGED]) {
                    var rangedSprite, hitSprite;
                    if (i % 2 === 0) {
                        rangedSprite = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage("img/ranged1.png"), 128, 0);
                        hitSprite = new PIXI.Sprite(PIXI.Texture.fromImage("img/hit1.png"));
                    } else {
                        rangedSprite = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage("img/ranged2.png"), 128, 0);
                        hitSprite = new PIXI.Sprite(PIXI.Texture.fromImage("img/hit2.png"));
                    }
                    rangedSprite.anchor.x = rangedSprite.anchor.y = 0.5;
                    stage.addChild(rangedSprite);
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
                var sprite = characterSprites[i][j], healthBar = characterHealthBars[i][j];
                if (character.health <= 0) {
                    sprite.alpha = healthBar.alpha = 0;
                    return;
                }
                var values = updateCharacter(cellX, cellY, character, i, j, tickFraction, stage);

                sprite.position.x = (values.x + 0.5) * cellX; sprite.position.y = (values.y + 0.5) * cellY; sprite.rotation = values.angle * Math.PI / 180;
                sprite.width = sprite.height = cellX;

                healthBar.position.x = sprite.position.x - sprite.width * 0.5;
                healthBar.position.y = sprite.position.y - sprite.height * 0.5;
                healthBar.height = sprite.height * 0.10;
                healthBar.width = sprite.width * (character.health / character.max_health); 
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
    switch (character.previous_action) { // interpolate and predict the next player's position
        case FORWARD:
            var actionElapsedTicks = (character.cooldowns.move_normal - character.current_cooldown) + tickFraction;
            var progress = Math.min(actionElapsedTicks / character.cooldowns.move_normal, 1);
            var fromX = character.x - getX(character.angle), fromY = character.y - getY(character.angle);
            x = fromX + (character.x - fromX) * progress; y = fromY + (character.y - fromY) * progress;
            break;
        case BACKWARD:
            var actionElapsedTicks = (character.cooldowns.move_slow - character.current_cooldown) + tickFraction;
            var progress = Math.min(actionElapsedTicks / character.cooldowns.move_slow, 1);
            var fromX = character.x + getX(character.angle), fromY = character.y + getY(character.angle);
            x = fromX + (character.x - fromX) * progress; y = fromY + (character.y - fromY) * progress;
            break;
        case STRAFE_LEFT:
            var actionElapsedTicks = (character.cooldowns.move_slow - character.current_cooldown) + tickFraction;
            var progress = Math.min(actionElapsedTicks / character.cooldowns.move_slow, 1);
            var fromX = character.x - getY(character.angle), fromY = character.y + getX(character.angle);
            x = fromX + (character.x - fromX) * progress; y = fromY + (character.y - fromY) * progress;
            break;
        case STRAFE_RIGHT:
            var actionElapsedTicks = (character.cooldowns.move_slow - character.current_cooldown) + tickFraction;
            var progress = Math.min(actionElapsedTicks / character.cooldowns.move_slow, 1);
            var fromX = character.x + getY(character.angle), fromY = character.y - getX(character.angle);
            x = fromX + (character.x - fromX) * progress; y = fromY + (character.y - fromY) * progress;
            break;
        case TURN_LEFT: case TURN_RIGHT:
            var actionElapsedTicks = (character.cooldowns.turn - character.current_cooldown) + tickFraction;
            var progress = Math.min(actionElapsedTicks / character.cooldowns.turn, 1);
            var fromAngle = character.angle - (character.previous_action === TURN_LEFT ? -90 : 90)
            angle = fromAngle + (character.angle - fromAngle) * progress;
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
