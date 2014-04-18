function Controller (options){
    var snakes = {};
    var bonus = {};
    
    var killed_snake_callback = options.callbacks.killed_snake;
    var eaten_bonus_callback = options.callbacks.eaten_bonnus;
    var add_points_callback = options.callbacks.add_points;
    var add_bonus_callback = options.callbacks.add_bonus;
    var add_snake_callback = options.callbacks.add_snake;
    var update_callback = options.callbacks.update;
    var change_direction_callback = options.callbacks.change_direction;
    
    var points_bonnus = options.points_bonnus;
    
    var to_kill = [], num_snakes = 0;
    
    var that = this;

    this.addSnake = function (id, coords, direction, score, size, name, cum_score) {
        snakes[id] = {};
        snakes[id].coords = coords;
        snakes[id].direction = direction;
        snakes[id].score = score;
        snakes[id].size = size;
        snakes[id].name = name;
        snakes[id].cum_score = cum_score;
        num_snakes++;
        add_snake_callback(id, coords, direction, score, size, name, cum_score);
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
        if(validateMove(snakes[id].direction, direction)) {
            snakes[id].direction = direction;
            if ((typeof coords !== "undefined") && (typeof coords[0] !== "undefined") && (typeof coords[1] !== "undefined")){
                snakes[id].coords[0] = [coords[0], coords[1]];
                snakes[id].coords.unshift([coords[0], coords[1]]);
                change_direction_callback(id, direction, [coords[0], coords[1]]);
            } else {
                snakes[id].coords.unshift([snakes[id].coords[0][0], snakes[id].coords[0][1]]);
                change_direction_callback(id, direction, [snakes[id].coords[0][0], snakes[id].coords[0][1]]);
            }
        }
    };
    
    
    this.addBonus = function (id, coords) {
        bonus[id] = coords;
        add_bonus_callback(id, coords);
    };
    
    this.getNumSnakes = function () {
        return num_snakes;
    };
    
    this.eatBonus = function(id, by) {
        if((typeof by === "undefined") || (by === null)) {
            eaten_bonus_callback(id, undefined);
            delete bonus[id];
            return;
        }
        snakes[by].size += 3;
        eaten_bonus_callback(id, by);
        addPoints(by);
        delete bonus[id];
    };
    
    function addPoints(id) {
        snakes[id].score += points_bonnus;
        add_points_callback(id, snakes[id].score);
    }
    
    function updatePosition (){
        for (var i in snakes){
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
            if (snakes[i].size <= snakeSize(snakes[i])){
                snakes[i].coords[snakes[i].coords.length-1][0] -= (snakes[i].coords[snakes[i].coords.length-1][0]-snakes[i].coords[snakes[i].coords.length-2][0])/Math.max(1,Math.abs(snakes[i].coords[snakes[i].coords.length-1][0]-snakes[i].coords[snakes[i].coords.length-2][0]));
                snakes[i].coords[snakes[i].coords.length-1][1] -= (snakes[i].coords[snakes[i].coords.length-1][1]-snakes[i].coords[snakes[i].coords.length-2][1])/Math.max(1,Math.abs(snakes[i].coords[snakes[i].coords.length-1][1]-snakes[i].coords[snakes[i].coords.length-2][1]));
                if ((snakes[i].coords[snakes[i].coords.length-1][0] === snakes[i].coords[snakes[i].coords.length-2][0]) && (snakes[i].coords[snakes[i].coords.length-1][1] === snakes[i].coords[snakes[i].coords.length-2][1])){
                    snakes[i].coords.pop();
                }
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
                if((bonus[j] !== null) && (typeof bonus[j] !== "undefined")) {
                    if ((snakes[i].coords[0][0] === bonus[j][0]) && (snakes[i].coords[0][1] === bonus[j][1])){
                        that.eatBonus(j,i);
                    }
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
        updatePosition();
        checkCollision();
        
        while (to_kill.length > 0){
            var tokill = to_kill.pop();
            that.killSnake(tokill[0], tokill[1]);
        }
        
        checkBonus();
        if ((typeof callback === "undefined") || (callback === true)){
            update_callback(snakes, bonus);
        }
    };
    
    this.getCounter = function () {
        return this.counter;
    };
    
    if (!(options.disable_update === true)){
        setInterval(this.update, (1/options.update_rate)*1000); // Update the game regularly
    }
}
if (typeof module !== "undefined"){
    module.exports.Controller = Controller;
}