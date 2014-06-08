var Controller = require('../common/controller/controller.js').Controller;

function get_controller(update_cb) {
    return new Controller({
        callbacks: {
            update: update_cb,
            eaten_bonnus: function(id) {},
            add_points: function(id, score) {},
            add_bonus: function(id, coords) {},
            add_snake: function(id, coords, direction, score, size, name) {},
            killed_snake: function(id) {},
            change_direction: function(id, direction) {}
        },
        points_bonus: 10,
        disable_update: true,
        update_rate: 10
    });
}

exports.add_snake = function(test){
    var game, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(13);

    test.ok(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0));
    test.equal(controller.addSnake("ID", {dan:"lekouby"}, "u", 0, 20, "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], 40, 0, 20, "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", "haha", 20, "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, "haha", "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, 40, 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", [0, 0], 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, "50"), false);
    
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "z", 0, 20, "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", -1, 20, "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, -42, "Name", 0, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", -404, 0), false);
    test.equal(controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, -48), false);
    
    test.done();
};

exports.basic_update = function(test){
    var game, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);
    controller.update();

    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [0, - 1],
                    [0, 0]
                ],
                direction: "u",
                score: 0,
                size: 20,
                name: "Name",
                cum_score: 0,
                speedup: 0,
                last_update_direction: "u"
            }
        }
    });
    
    test.done();
};

exports.size_control = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 40; i += 1){
        controller.update();
    }
    
    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [0, - 20],
                    [0, - 1]
                ],
                direction: "u",
                score: 0,
                size: 20,
                name: "Name",
                cum_score: 0,
                speedup: 0,
                last_update_direction: "u"
            }
        }
    });

    test.done();
};

exports.bonus_basic = function(test){
    var game, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(8);

    test.ok(controller.addBonus("ID", [0, 0], 0));
    test.equal(controller.addBonus("ID", [0, 0], "LOLL"), false);
    test.equal(controller.addBonus("ID", "#swag", 0), false);
    test.equal(controller.addBonus(42, [0, 0], 0), false);
    test.equal(controller.addBonus("ID", [0, 0, 0, 0], 0), false);
    test.equal(controller.addBonus("ID", [0, 0], - 404), false);
    test.equal(controller.addBonus("ID", [0, 0], 0), false);
        
    controller.update();

    test.deepEqual(game, {
        bonuses: {
            ID:[ 
                [0, 0], 0]
        },
        snakes: {}
    });

    test.done();
};

exports.bonus_eat = function(test){
    var game, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addBonus("ID", [0, - 1], 0);
    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    controller.update();

    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [0, - 1],
                    [0, 0]
                ],
                direction: 'u',
                score: 10,
                size: 23,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'u'
            }
        }
    });
    
    test.done();
};

exports.bonus_eat_manual = function(test){
    var game, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(5);

    controller.addBonus("ID", [1337, - 1], 0);
    controller.addBonus("ID2", [418, - 1], 0);
    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);
    
    test.ok(controller.eatBonus("ID", "ID"));
    test.ok(controller.eatBonus("ID2"));
    test.equal(controller.eatBonus("DAN", "ID"), false);
    test.equal(controller.eatBonus("ID", "ID"), false);

    controller.update();

    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [0, - 1],
                    [0, 0]
                ],
                direction: 'u',
                score: 10,
                size: 23,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'u'
            }
        }
    });
    
    test.done();
};

exports.bonus_size = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addBonus("ID", [0, - 1], 0);
    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 60; i += 1){
        controller.update();
    }

    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [0, - 30],
                    [0, - 8]
                ],
                direction: 'u',
                score: 10,
                size: 23,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'u'
            }
        }
    });
    
    test.done();
};

exports.bonus_speed = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addBonus("ID", [0, - 1], 1);
    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 60; i += 1){
        controller.update();
    }

    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [0, - 50],
                    [0, - 31]
                ],
                direction: 'u',
                score: 10,
                size: 20,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'u'
            }
        }
    });
    
    test.done();
};

exports.change_direction_basic = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(6);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
    
    test.equal(controller.changeDirection("DAN", "l"), false);
    test.equal(controller.changeDirection("ID", "u"), false);
    test.equal(controller.changeDirection("ID", "d"), false);
    test.equal(controller.changeDirection("ID", "z"), false);
    test.ok(controller.changeDirection("ID", "l"));

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
   
    
    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [-5, - 5],
                    [0, - 5],
                    [0, 0]
                ],
                direction: 'l',
                score: 0,
                size: 20,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'l'
            }
        }
    });
    
    test.done();
};

exports.change_direction_tricky = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(4);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
    
    test.ok(controller.changeDirection("ID", "l"));
    test.ok(controller.changeDirection("ID", "d"));
    
    controller.update();
    
    test.ok(controller.changeDirection("ID", "l"));

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
   
    
    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID: {
                coords: [
                    [-5, - 4],
                    [-1, - 4],
                    [-1, - 5],
                    [0, - 5],
                    [0, 0]
                ],
                direction: 'l',
                score: 0,
                size: 20,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'l'
            }
        }
    });
    
    test.done();
};
    
exports.autokill = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
    
    controller.changeDirection("ID", "l");
    controller.changeDirection("ID", "d");
    
    controller.update();
    
    controller.changeDirection("ID", "r");
    
    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
   

    test.deepEqual(game, {
        bonuses: {},
        snakes: {}
    });
    
    test.done();
};

exports.doublekill = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);
    controller.addSnake("ID2", [[- 1, - 1], [- 1, - 1]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
    
    controller.changeDirection("ID2", "r");

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
   

    test.deepEqual(game, {
        bonuses: {},
        snakes: {}
    });
    
    test.done();
};

exports.kill = function(test){
    var game, i, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(1);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);
    controller.addSnake("ID2", [[- 1, - 1], [- 1, - 1]], "u", 0, 20, "Name", 0, 0);

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
    
    controller.changeDirection("ID", "l");

    for (i = 0 ;  i < 10; i += 1){
        controller.update();
    }
   

    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID2: {
                coords: [
                    [-1, - 11],
                    [-1, - 1]
                ],
                direction: 'u',
                score: 0,
                size: 30,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'u'
            }
        }
    });
        
    test.done();
};

exports.kill_manual = function(test){
    var game, controller = get_controller(function(snakes, bonuses){
        game = {bonuses : bonuses, snakes : snakes};
    });

    test.expect(4);

    controller.addSnake("ID", [[0, 0], [0, 0]], "u", 0, 20, "Name", 0, 0);
    controller.addSnake("ID2", [[- 1, - 1], [- 1, - 1]], "u", 0, 20, "Name", 0, 0);
    controller.addSnake("ID3", [[1, 1], [1, 1]], "u", 0, 20, "Name", 0, 0);

    test.ok(controller.killSnake("ID3", "IDFX"));
    test.equal(controller.killSnake("ID3"), false);
    test.ok(controller.killSnake("ID", "ID2"));

    controller.update();


    test.deepEqual(game, {
        bonuses: {},
        snakes: {
            ID2: {
                coords: [
                    [-1, - 2],
                    [-1, - 1]
                ],
                direction: 'u',
                score: 0,
                size: 30,
                name: 'Name',
                cum_score: 0,
                speedup: 0,
                last_update_direction: 'u'
            }
        }
    });
        
    test.done();
};


