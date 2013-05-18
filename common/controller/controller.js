function Controller (){
    this.snakes = {};
    this.addSnake = function (snake) {
        this.snakes[snake.id] = snake;
    };
    this.killSnake = function (id) {
        delete this.snakes[id];
    };
    
}