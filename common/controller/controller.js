function Controller (options){
    var snakes = {};
    var bonus = {};
    
    var killed_snake_callback = options.callbacks.killed_snake;
    var eaten_bonus_callback = options.callbacks.eaten_bonnus;
    var add_points_callback = options.callbacks.add_points;
    var add_bonus_callback = options.callbacks.add_bonnus;
    var update_callback = options.callbacks.update;
    
    var points_bonnus = options.points_bonnus;
    var num_snakes = 0;
    
    var to_kill = [];
    
    this.addSnake = function (id, coords, direction, score, size) {
        snakes[id].coords = coords;
        snakes[id].direction = direction;
        snakes[id].score = score;
        snakes[id].size = size;
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
    
    this.getNumSnakes = function () {
        return num_snakes;
    };
    
    function eatBonus(id) {
        delete bonus[id];
        eaten_bonus_callback(id);
    }
    
    function addPoints(id) {
        snakes[id].score += points_bonnus;
        add_points_callback(id, snakes[id].score);
    }
    
    function updatePosition (){
        for (var i in snakes){
            if (snakes[i].size <= snakes[i].coords.length){
                snakes[i].coords.pop();
            }
            
            var newcoords = [];
            switch (snakes[i].direction) {
                case "u" :
                    newcoords = [snakes[i].coords[0][0], snakes[i].coords[0][1] + 1];
                break;
                case "d" :
                    newcoords = [snakes[i].coords[0][0], snakes[i].coords[0][1] - 1];
                break;
                case "l" :
                    newcoords = [snakes[i].coords[0][0] - 1, snakes[i].coords[0][1]];
                break;
                case "r" :
                    newcoords = [snakes[i].coords[0][0] + 1, snakes[i].coords[0][1]];
                break;
                default:
            }
            snakes[i].coords.unshift(newcoords);
            
        }
    }
    
    function checkCollision(){
        for (var tested in snakes){
            for (var reciever in snakes){
                for (var i in snakes[reciever].coords){
                    if (snakes[tested].coords[0] == snakes[reciever].coords[i]){
                        to_kill.push(tested);
                    }
                }
            }
        }
    }

    function checkBonus() {
        for (var i in snakes){
            for (var j in bonus){
                if (snakes[i].coords[0] == bonus[j]){
                    eatBonus(j);
                }
            }
        }
    }
    
    this.update = function () {     // This is where the magic happens
        updatePosition();
        checkCollision();
        
        while (to_kill.length > 0){
            this.killSnake(to_kill.pop());
        }
        
        checkBonus();
        update_callback(snakes, bonus);
    };

    setInterval(this.update, (1/options.update_rate)*1000); // Update the game regularly

}

module.exports.Controller = Controller;
