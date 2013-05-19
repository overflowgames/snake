function Controller (options){
    this.snakes = {};
    this.bonnus = [];
    this.killed_snake_callback = options.killed_snake;
    this.eaten_bonnus_callback = options.eaten_bonnus;
    
    this.addSnake = function (id, coords, direction) {
        this.snakes[id].coords = coords;
        this.snakes[id].direction = direction;
    };
    
    this.killSnake = function (id) {
        delete this.snakes[id];
    };
    
    this.changeDirection = function (id, direction) {
        this.snakes[id].direction = direction;
    };
    
    this.getSnake = function (id) {
        return this.snakes[id];
    };
    
    this.addBonnus = function (coords) {
        this.bonnus.push(coords);
    };
    
    this.update = function () {     // This is where the magic happens
        
    };

    setInterval(this.update, (1/options.update_rate)*1000); // Update the game regularly

}