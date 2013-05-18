function Controller (update_rate){
    this.snakes = {};
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
    
    this.update = function () {     // This is where the magic happens
        
    };

    setInterval(this.update, (1/update_rate)*1000); // Update the game regularly

}