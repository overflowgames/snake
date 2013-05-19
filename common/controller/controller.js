var uuid = require("node-uuid");

function Controller (options){
    var snakes = {};
    var bonnus = {};
    var killed_snake_callback = options.killed_snake;
    var eaten_bonnus_callback = options.eaten_bonnus;
    var add_points_callback = options.add_points;
    var add_bonnus_callback = options.add_bonnus;
    
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
    
    this.addBonnus = function (id, coords) {
        bonnus[id] = coords;
        add_bonnus_callback(id, coords);
    };
    
    function eatBonnus(id) {
        delete bonnus[id];
        eaten_bonnus_callback(id);
    }
    
    function genBonnusCoords(){
        
    }
    
    function addPoints(id) {
        snakes[id].score += points_bonnus;
        add_points_callback(id, snakes[id].score);
    }
    
    this.update = function () {     // This is where the magic happens
        if (Math.random() < ((-Math.abs(1/num_snakes)) + 1) ){
            var id = uuid.v4();
            this.addBonnus(id, genBonnusCoords());
        }
    };

    setInterval(this.update, (1/options.update_rate)*1000); // Update the game regularly

}