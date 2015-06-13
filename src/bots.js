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
                    forward_cooldown: 4, // tick counts
                    move_cooldown: 8,
                    attack_cooldown: 15,
                    heal_cooldown: 20,
                    current_cooldown: 5,
                },
                {
                    x: 1, y: 3, angle: 0,
                    forward_cooldown: 4,
                    move_cooldown: 8,
                    attack_cooldown: 15,
                    heal_cooldown: 20,
                    current_cooldown: 2,
                },
                {
                    x: 1, y: 5, angle: 270,
                    forward_cooldown: 4,
                    move_cooldown: 8,
                    attack_cooldown: 15,
                    defend_cooldown: 25,
                    heal_cooldown: 20,
                    current_cooldown: 0,
                },
            ],
        },
    ],
    global_speed: 2, // ticks per second
    terrain: [
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
    ],
};

function main() {
    var cellX = 64, cellY = 64;

    var renderer = new PIXI.CanvasRenderer(800, 600);
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container();

    var player_texture = PIXI.Texture.fromImage("img/test.png");

    // set up players
    var characterSprites = state.players.map(function(player, i) {
        return player.characters.map(function(character, j) {
            var sprite = new PIXI.Sprite(player_texture);
            sprite.width = sprite.height = cellX;
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.scale.x = 2; sprite.scale.y = 2;
            stage.addChild(sprite);
            return sprite;
        });
    });

    function onTick() {
        state.players.forEach(function(player, i) {
            player.characters.forEach(function(character, j) {
                var prevX = character.x - getX(character.angle), prevY = character.y - getY(character.angle);
                var sprite = characterSprites[i][j];
                sprite.position.x = character.x * cellX; sprite.position.y = character.y * cellY; sprite.rotation = character.angle * Math.PI / 180;
            });
        });
        
        renderer.render(stage);
    }
    
    var animations = [];
    
    var lastAnimate = Date.now();
    var accumulator = 0;
    var timestep = 500;
    function animate() {
        var now = Date.now(); var dt = now - lastAnimate; lastAnimate = now;
        accumulator += dt;
        while (accumulator >= timestep) {
            onTick();
            accumulator -= timestep;
        }
        
        // process animations
        
        
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
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
