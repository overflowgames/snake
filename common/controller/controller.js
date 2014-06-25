/*jslint browser: true, node: true */

function Controller(options) {
    "use strict";
    var snakes = {}, bonus = {},

        killed_snake_callback = options.callbacks.killed_snake,
        eaten_bonus_callback = options.callbacks.eaten_bonnus,
        add_bonus_callback = options.callbacks.add_bonus,
        add_snake_callback = options.callbacks.add_snake,
        update_callback = options.callbacks.update,
        change_direction_callback = options.callbacks.change_direction,

        points_bonus = options.points_bonus,

        to_kill = [], num_snakes = 0,

        that = this,

        speedup_update = false;

    this.addSnake = function (id, coords, direction, score, size, name, cum_score, speedup) {
        if (!Array.isArray(coords) || typeof direction !== "string" || typeof score !== "number" || typeof size !== "number" || typeof name !== "string" || typeof cum_score !== "number" || typeof speedup !== "number") {
            return false;
        }
        if (["u", "l", "r", "d"].indexOf(direction) === -1 || score < 0 || size < 0 || cum_score < 0 || speedup < 0) {
            return false;
        }
        snakes[id] = {};
        snakes[id].coords = coords;
        snakes[id].direction = direction;
        snakes[id].score = score;
        snakes[id].size = size;
        snakes[id].name = name;
        snakes[id].cum_score = cum_score;
        snakes[id].speedup = speedup;
        snakes[id].last_update_direction = direction;
        num_snakes += 1;
        if (typeof add_snake_callback === "function") {
            add_snake_callback.call(this, id, coords, direction, score, size, name, cum_score, speedup);
        }

        return true;
    };

    this.killSnake = function (id, by) {
        if (snakes[id] !== undefined) {
            if ((by !== id) && (snakes[by] !== undefined)) {
                snakes[by].size += snakes[id].size / 2;
                snakes[by].score += snakes[id].score / 2;
            }
            if (typeof killed_snake_callback === "function") {
                killed_snake_callback.call(this, id, snakes[id].score, by);
            }
            delete snakes[id];
            num_snakes -= 1;
            return true;
        }
        return false;
    };

    function validateMove(orientation, new_direction) {
        if (orientation === new_direction) {
            return false;
        }
        return !((orientation === "u" && new_direction === "d") || (orientation === "d" && new_direction === "u") || (orientation === "l" && new_direction === "r") || (orientation === "r" && new_direction === "l"));
    }

    this.changeDirection = function (id, direction, coords) {
        var directions = ["u", "d", "l", "r"];
        if ((snakes[id] !== undefined) && (validateMove(snakes[id].direction, direction)) && (directions.indexOf(direction) !== -1)) {
            if (validateMove(snakes[id].last_update_direction, direction)) {
                snakes[id].direction = direction;
                if ((coords !== undefined) && (coords[0] !== undefined) && (coords[1] !== undefined)) {
                    snakes[id].coords[0] = [coords[0], coords[1]];
                    snakes[id].coords.unshift([coords[0], coords[1]]);
                    if (typeof change_direction_callback === "function") {
                        change_direction_callback.call(this, id, direction, [coords[0], coords[1]]);
                    }
                } else {
                    snakes[id].coords.unshift([snakes[id].coords[0][0], snakes[id].coords[0][1]]);
                    if (typeof change_direction_callback === "function") {
                        change_direction_callback.call(this, id, direction, [snakes[id].coords[0][0], snakes[id].coords[0][1]]);
                    }
                }
            } else {
                snakes[id].next_direction = direction;
            }
            return true;
        }
        return false;
    };

    this.addBonus = function (id, coords, type) {
        if (typeof type !== "number" || typeof id !== "string" || !Array.isArray(coords)) {
            return false;
        }
        if (type < 0 || coords.length > 2) {
            return false;
        }
        if (bonus[id] !== undefined) {
            return false;
        }
        bonus[id] = [coords, type];
        if (typeof add_bonus_callback === "function") {
            add_bonus_callback.call(this, id, coords, type);
        }
        return true;
    };

    this.getNumSnakes = function () {
        return num_snakes;
    };

    this.eatBonus = function (id, by) {
        if (bonus[id] === undefined) {
            return false;
        }
        if ((by === undefined) || (by === null) || (snakes[by] === undefined)) {
            if (typeof eaten_bonus_callback === "function") {
                eaten_bonus_callback.call(this, id, undefined);
            }
            delete bonus[id];
        } else {

            switch (bonus[id][1]) {
            case 0:
                snakes[by].size += 3;
                break;
            case 1:
                snakes[by].speedup += 20;
                break;
            }

            if (typeof eaten_bonus_callback === "function") {
                eaten_bonus_callback.call(this, id, by);
            }

            snakes[by].score += points_bonus;
            delete bonus[id];
        }
        return true;
    };

    this.snakeSize = function (id) {
        var cum = 0, i, snake = snakes[id];
        for (i = 0; i < snake.coords.length; i += 1) {
            if (snake.coords[i + 1] !== undefined) {
                cum += Math.abs(snake.coords[i][0] - snake.coords[i + 1][0]);
                cum += Math.abs(snake.coords[i][1] - snake.coords[i + 1][1]);
            }
        }
        return cum;
    };

    function coordsequal(coords1, coords2) {
        return (coords1[0] === coords2[0]) && (coords1[1] === coords2[1]);
    }

    function updatePosition(speedup) {
        var i, j;
        for (i in snakes) {
            if (snakes.hasOwnProperty(i)) {
                if ((speedup && snakes[i].speedup > 0) || (!speedup)) {
                    snakes[i].last_update_direction = snakes[i].direction;
                    switch (snakes[i].direction) {
                    case "u":
                        snakes[i].coords[0][1] -= 1;
                        break;
                    case "d":
                        snakes[i].coords[0][1] += 1;
                        break;
                    case "l":
                        snakes[i].coords[0][0] -= 1;
                        break;
                    case "r":
                        snakes[i].coords[0][0] += 1;
                        break;
                    }
                    while (snakes[i].size <= that.snakeSize(i)) {
                        for (j = 0; j < snakes[i].coords[snakes[i].coords.length - 1].length; j += 1) {
                            snakes[i].coords[snakes[i].coords.length - 1][j] -= (snakes[i].coords[snakes[i].coords.length - 1][j] - snakes[i].coords[snakes[i].coords.length - 2][j]) / Math.max(1, Math.abs(snakes[i].coords[snakes[i].coords.length - 1][j] - snakes[i].coords[snakes[i].coords.length - 2][j]));
                        }
                        if (coordsequal(snakes[i].coords[snakes[i].coords.length - 1], snakes[i].coords[snakes[i].coords.length - 2])) {
                            snakes[i].coords.pop();
                        }
                    }
                    if (snakes[i].next_direction !== undefined) {
                        that.changeDirection(i, snakes[i].next_direction);
                        delete snakes[i].next_direction;
                    }
                }
                if (speedup && snakes[i].speedup > 0) {
                    snakes[i].speedup -= 1;
                }
            }
        }
    }

    function comparePos(p1, p2, idem) {
        var i;
        for (i = 0; i < p2.length; i += 1) {
            if (!(idem && (p1[1] === p2[i][1]) && (p1[0] === p2[i][0]))) {
                if (p2[i + 1] !== undefined) {
                    if ((p1[0] <= Math.max(p2[i][0], p2[i + 1][0])) && (p1[0] >= Math.min(p2[i][0], p2[i + 1][0])) && (p1[1] <= Math.max(p2[i][1], p2[i + 1][1])) && (p1[1] >= Math.min(p2[i][1], p2[i + 1][1]))) {
                        return i + 1;
                    }
                }
            }
        }
        return false;
    }

    function checkCollision() {
        var tested, reciever;
        for (tested in snakes) {
            if (snakes.hasOwnProperty(tested)) {
                for (reciever in snakes) {
                    if (snakes.hasOwnProperty(reciever)) {
                        if (reciever !== tested) {
                            if (comparePos(snakes[tested].coords[0], snakes[reciever].coords)) {
                                to_kill.push([tested, reciever]);
                            }
                        } else if (comparePos(snakes[tested].coords[0], snakes[reciever].coords, true)) {
                            to_kill.push([tested, reciever]);
                        }
                    }
                }
            }
        }
    }

    function checkBonus() {
        var i, j;
        for (i in snakes) {
            if (snakes.hasOwnProperty(i)) {
                for (j in bonus) {
                    if (bonus.hasOwnProperty(j)) {
                        if ((typeof bonus[j] === "object") && (bonus[j][0] !== undefined)) {
                            if ((snakes[i].coords[0][0] === bonus[j][0][0]) && (snakes[i].coords[0][1] === bonus[j][0][1])) {
                                that.eatBonus(j, i);
                            }
                        } else {
                            console.log(bonus[j]);
                        }
                    }
                }
            }
        }
    }

    this.load = function (s, b) {
        snakes = s || snakes;
        bonus = b || bonus;
    };

    this.update = function () {     // This is where the magic happens
        var tokill;
        updatePosition(speedup_update);
        checkCollision();
        while (to_kill.length > 0) {
            tokill = to_kill.pop();
            that.killSnake(tokill[0], tokill[1]);
        }

        checkBonus();
        if (typeof update_callback === "function") {
            update_callback.call(this, snakes, bonus);
        }

        speedup_update = !speedup_update;
    };

    setInterval(this.update, (1 / options.update_rate) * (1000 / 2)); // Update the game regularly
}

try {
    module.exports.Controller = Controller;
} catch (ignore) {}