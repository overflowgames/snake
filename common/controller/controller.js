function Controller (options){
    var snakes = {};
    var bonus = {};
    var killed_snake_callback = options.killed_snake;
    var eaten_bonus_callback = options.eaten_bonnus;
    var add_points_callback = options.add_points;
    var add_bonus_callback = options.add_bonnus;
    
    var points_bonnus = options.points_bonnus;
    
    var num_snakes = 0;
    
    this.addSnake = function (id, coords, direction, score) {
        snakes[id].coords = coords;
        snakes[id].direction = direction;
        snakes[id].score = score;
        num_snakes++;
    };
    
    this.killSnake = function (id) {
        delete snakes[id];
        num_snakes--;
        killed_snake_callback(id);
    };
    
    this.changeDirection = function (id, direction) {
        snakes[id].direction = direction;
    };
    
    this.addBonus = function (id, coords) {
        bonus[id] = coords;
        add_bonus_callback(id, coords);
    };
    
    function eatBonus(id) {
        delete bonus[id];
        eaten_bonus_callback(id);
    }
    
    function addPoints(id) {
        snakes[id].score += points_bonnus;
        add_points_callback(id, snakes[id].score);
    }
    
    this.update = function () {     // This is where the magic happens
        
    };

    setInterval(this.update, (1/options.update_rate)*1000); // Update the game regularly

}