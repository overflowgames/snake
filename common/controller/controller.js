function Controller (options){
    var snakes = {};
    var bonus = {};
    
    var killed_snake_callback = options.callbacks.killed_snake;
    var eaten_bonus_callback = options.callbacks.eaten_bonnus;
    var add_bonus_callback = options.callbacks.add_bonus;
    var add_snake_callback = options.callbacks.add_snake;
    var update_callback = options.callbacks.update;
    var change_direction_callback = options.callbacks.change_direction;
    
    var points_bonus = options.points_bonnus;
    
    var to_kill = [], num_snakes = 0;
    
    var that = this;
    
    var speedup_update = true;

    this.addSnake = function (id, coords, direction, score, size, name, cum_score, speedup) {
        snakes[id] = {};
        snakes[id].coords = coords;
        snakes[id].direction = direction;
        snakes[id].score = score;
        snakes[id].size = size;
        snakes[id].name = name;
        snakes[id].cum_score = cum_score;
        snakes[id].speedup = speedup;
        num_snakes++;
        add_snake_callback(id, coords, direction, score, size, name, cum_score, speedup);
    };
    
    this.killSnake = function (id, by) {
        if (typeof snakes[id] !== "undefined"){ 
            if ((by !== id) && (typeof snakes[by] !== "undefined")){
                snakes[by].size += snakes[id].size/2;
                snakes[by].score += snakes[id].score/2;
            }
            killed_snake_callback(id, snakes[id].score, by);
            delete snakes[id];
            num_snakes--;
        }
    };
    
    this.changeDirection = function (id, direction, coords) {
        if ((typeof snakes[id] !== "undefined") && (validateMove(snakes[id].direction, direction))) {
            if (validateMove(snakes[id].last_update_direction, direction)){
                snakes[id].direction = direction;
                if ((typeof coords !== "undefined") && (typeof coords[0] !== "undefined") && (typeof coords[1] !== "undefined")){
                    snakes[id].coords[0] = [coords[0], coords[1]];
                    snakes[id].coords.unshift([coords[0], coords[1]]);
                    change_direction_callback(id, direction, [coords[0], coords[1]]);
                } else {
                    snakes[id].coords.unshift([snakes[id].coords[0][0], snakes[id].coords[0][1]]);
                    change_direction_callback(id, direction, [snakes[id].coords[0][0], snakes[id].coords[0][1]]);
                }
            } else {
                snakes[id].next_direction = direction;
            }
        }
    };
    
    
    this.addBonus = function (id, coords, type) {
        bonus[id] = [coords, type];
        add_bonus_callback(id, coords, type);
    };
    
    this.getNumSnakes = function () {
        return num_snakes;
    };
    
    this.eatBonus = function(id, by) {
        if (typeof bonus[id] === "undefined"){
            return false;
        }
        if((typeof by === "undefined") || (by === null)) {
            eaten_bonus_callback(id, undefined);
            delete bonus[id];
        } else {
            
            switch(bonus[id][1]){
                case 0 :
                    snakes[by].size += 3;
                break;
                case 1 : 
                    snakes[by].speedup += 20;
                break;
            }
            
            eaten_bonus_callback(id, by);
            snakes[by].score += points_bonus;
            delete bonus[id];
        }
    };
    
    function updatePosition (speedup){
        for (var i in snakes){
            if (speedup){
                if (snakes[i].speedup > 0){
                    snakes[i].speedup --;
                } else {
                    continue;
                }
            }
            snakes[i].last_update_direction = snakes[i].direction;
            switch (snakes[i].direction) {
                case "u" :
                    snakes[i].coords[0][1] -= 1;
                break;
                case "d" :
                    snakes[i].coords[0][1] += 1;
                break;
                case "l" :
                    snakes[i].coords[0][0] -= 1;
                break;
                case "r" :
                    snakes[i].coords[0][0] += 1;
                break;
                default:
            }
            while (snakes[i].size <= snakeSize(snakes[i])){
                snakes[i].coords[snakes[i].coords.length-1][0] -= (snakes[i].coords[snakes[i].coords.length-1][0]-snakes[i].coords[snakes[i].coords.length-2][0])/Math.max(1,Math.abs(snakes[i].coords[snakes[i].coords.length-1][0]-snakes[i].coords[snakes[i].coords.length-2][0]));
                snakes[i].coords[snakes[i].coords.length-1][1] -= (snakes[i].coords[snakes[i].coords.length-1][1]-snakes[i].coords[snakes[i].coords.length-2][1])/Math.max(1,Math.abs(snakes[i].coords[snakes[i].coords.length-1][1]-snakes[i].coords[snakes[i].coords.length-2][1]));
                if ((snakes[i].coords[snakes[i].coords.length-1][0] === snakes[i].coords[snakes[i].coords.length-2][0]) && (snakes[i].coords[snakes[i].coords.length-1][1] === snakes[i].coords[snakes[i].coords.length-2][1])){
                    snakes[i].coords.pop();
                }
            }
            if (typeof snakes[i].next_direction !== "undefined"){
                that.changeDirection(i, snakes[i].next_direction);
                delete snakes[i].next_direction;
            }
        }
    }
    
    function checkCollision(){ 
        for (var tested in snakes){
            for (var reciever in snakes){
                if (reciever !== tested) {
                    if (comparePos(snakes[tested].coords[0], snakes[reciever].coords)){
                        to_kill.push([tested, reciever]);
                    }
                } else if (comparePos(snakes[tested].coords[0], snakes[reciever].coords, true)){
                    to_kill.push([tested, reciever]);
                }
            }
        }
    }

    function checkBonus() {
        for (var i in snakes){
            for (var j in bonus){
                if((typeof bonus[j] === "object") && (typeof bonus[j][0] !== "undefined")) {
                    if ((snakes[i].coords[0][0] === bonus[j][0][0]) && (snakes[i].coords[0][1] === bonus[j][0][1])){
                        that.eatBonus(j,i);
                    }
                } else {
                    console.log(bonus[j]);
                }
            }
        }
    }
    
    function validateMove(orientation, new_direction) {
        if (orientation === new_direction){
            return false;
        }
        return !((orientation == "u" && new_direction == "d") ||(orientation == "d" && new_direction == "u")||(orientation == "l" && new_direction == "r")||(orientation == "r" && new_direction == "l"));
    }
    
    function comparePos(p1, p2, idem) {
        for (var i in p2){
            i = parseInt(i, 10);
            if ((idem) && (p1[1] === p2[i][1]) && (p1[0] === p2[i][0])) {
                continue;
            }
            if (typeof p2[i+1] !== "undefined"){
                if (p1[0] == p2[i][0]){
                    if ((p1[1] <= Math.max(p2[i][1], p2[i+1][1])) && (p1[1] >= Math.min(p2[i][1], p2[i+1][1]))){
                        return i+1;
                    }
                } else if (p1[1] == p2[i][1]){
                    if ((p1[0] <= Math.max(p2[i][0], p2[i+1][0])) && (p1[0] >= Math.min(p2[i][0], p2[i+1][0]))){
                        return i+1;
                    }
                }
            }
        }
        return false;
    }
    
    function snakeSize(snake){
        var cum = 0;
        for (var i in snake.coords){
            i = parseInt(i, 10);
            if (typeof snake.coords[i+1] !== "undefined"){
                cum += Math.abs(snake.coords[i][0] - snake.coords[i+1][0]);
                cum += Math.abs(snake.coords[i][1] - snake.coords[i+1][1]);
            }
        }
        return cum;
    }
    
    this.load = function(s, b) {
        snakes = s;
        bonus = b;
    };
    
    
    this.update = function (callback) {     // This is where the magic happens
        updatePosition(speedup_update);
        checkCollision();
        
        while (to_kill.length > 0){
            var tokill = to_kill.pop();
            that.killSnake(tokill[0], tokill[1]);
        }
        
        checkBonus();
        if ((typeof callback === "undefined") || (callback === true)){
            update_callback(snakes, bonus);
        }
        speedup_update = !speedup_update;
    };
    
    this.getCounter = function () {
        return this.counter;
    };
    
    if (!(options.disable_update === true)){
        setInterval(this.update, (1/options.update_rate)*(1000/2)); // Update the game regularly
    }
}
if (typeof module !== "undefined"){
    module.exports.Controller = Controller;
}