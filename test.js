    function getX(angle) {
        angle = angle % 360; if (angle < 0) angle += 360;
        return angle === 90 ? 1 : angle == 270 ? -1 : 0;
    }
    function getY(angle) {
        angle = angle % 360; if (angle < 0) angle += 360;
        return angle === 0 ? -1 : angle == 180 ? 1 : 0;
    }

return function(unit, state, valid_actions) {
    // attempt to move toward advantagous position, when strafing into the path of en enemy from behind
    var target_x = unit.x + getX(unit.angle) + getY(unit.angle), target_y = unit.y + getY(unit.angle) - getX(unit.angle);
    while (state.is_tile_pathable(target_x, target_y))
        target_x += getX(unit.angle); target_y += getY(unit.angle);
    var unit_to_attack = state.get_unit_in_tile(target_x, target_y);
    if (unit_to_attack !== null && getX(unit_to_attack.angle) == getX(unit.angle) && getY(unit_to_attack.angle) == getY(unit.angle))
        return "strafe_right"; // unit is facing away from the player, and we can strafe in immediately
    target_x = unit.x + getX(unit.angle) - getY(unit.angle), target_y = unit.y + getY(unit.angle) + getX(unit.angle);
    while (state.is_tile_pathable(target_x, target_y))
        target_x += getX(unit.angle); target_y += getY(unit.angle);
    unit_to_attack = state.get_unit_in_tile(target_x, target_y);
    if (unit_to_attack !== null && getX(unit_to_attack.angle) == getX(unit.angle) && getY(unit_to_attack.angle) == getY(unit.angle))
        return "strafe_left"; // unit is facing away from the player, and we can strafe in immediately

    // attack enemy in line of sight
    var attack_target = unit.acquire_target(state);
    unit_to_attack = state.get_unit_in_tile(attack_target.x, attack_target.y);
    if (unit_to_attack !== null) {
        return "ranged_attack";
    }

    return valid_actions[Math.floor(Math.random() * valid_actions.length)];
}