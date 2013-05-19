function Controller (options){
    var snakes = {};
    var bonnus = {};
    var killed_snake_callback = options.killed_snake;
    var eaten_bonnus_callback = options.eaten_bonnus;
    var add_points_callback = options.add_points;
    var points_bonnus = options.points_bonnus;
    
    this.addSnake = function (id, coords, direction) {
        snakes[id].coords = coords;
        snakes[id].direction = direction;
    };
    
    this.killSnake = function (id) {
        delete snakes[id];
    };
    
    this.changeDirection = function (id, direction) {
        snakes[id].direction = direction;
    };
    
    this.getSnake = function (id) {
        return snakes[id];
    };
    
    this.addBonnus = function (id, coords) {
        bonnus [id] = coords;
    };
    
    function eatBonnus(id) {
        delete bonnus[id];
    }
    
    this.update = function () {     // This is where the magic happens
        
    };

    setInterval(this.update, (1/options.update_rate)*1000); // Update the game regularly

}