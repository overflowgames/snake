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
    
    var counter = 0;
    
    var that = this;
    
    var game_history = [];
    var action_history = [];

    this.addSnake = function (id, coords, direction, score, size, name, cum_score) {
        snakes[id] = {};
        snakes[id].coords = coords;
        snakes[id].direction = direction;
        snakes[id].score = score;
        snakes[id].size = size;
        snakes[id].name = name;
        snakes[id].cum_score = cum_score;
        num_snakes++;
        add_snake_callback(id, coords, direction, score, size, name, cum_score, counter);
    };
    
    this.killSnake = function (id, by) {
        if (typeof snakes[id] !== "undefined"){ 
            if ((by !== id) && (typeof snakes[by] !== "undefined")){
                snakes[by].size += snakes[id].size/2;
                snakes[by].score += snakes[id].score/2;
                console.log("OKKKOKOK");
            }
            killed_snake_callback(id, snakes[id].score, by);
            delete snakes[id];
            num_snakes--;
        }
    };
    
    this.changeDirection = function (id, direction, c) {
        var ticks = c || counter;
        action_history.unshift({id : id, direction : direction, counter: ticks});
        if(validateMove(id, direction)) {
            if (ticks !== counter) {
                that.seek(ticks);
            } else {
                snakes[id].direction = direction;
            }
            change_direction_callback(id, direction, ticks);
        }
    };
    
    
    this.addBonus = function (id, coords) {
        bonus[id] = coords;
        add_bonus_callback(id, coords, counter);
    };
    
    this.getNumSnakes = function () {
        return num_snakes;
    };
    
    this.eatBonus = function(id, by) {
        if(by == -1 || typeof by == 'undefined') {
            eaten_bonus_callback(id, undefined, counter);
            delete bonus[id];
            return;
        }
        snakes[by].size += 3;
        eaten_bonus_callback(id, by, counter);
        addPoints(by);
        delete bonus[id];
    };
    
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
                    newcoords = [snakes[i].coords[0][0], snakes[i].coords[0][1] - 1];
                break;
                case "d" :
                    newcoords = [snakes[i].coords[0][0], snakes[i].coords[0][1] + 1];
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
                    if ((reciever !== tested) || (i != 0)) {
                        if (comparePos(snakes[tested].coords[0],snakes[reciever].coords[i])){
                            to_kill.push([tested, reciever]);
                            console.log(to_kill);
                        }
                    }
                }
            }
        }
    }

    function checkBonus() {
        for (var i in snakes){
            for (var j in bonus){
                if(bonus[j] != null) {
                    if (comparePos(snakes[i].coords[0],bonus[j])){
                        that.eatBonus(j,i);
                    }
                }
            }
        }
    }
    
    function validateMove(id_snake, new_direction) {
        var theSnake = snakes[id_snake];
        
        if (typeof(theSnake) === "undefined"){
            return false;
        }
        
        var theCoords = theSnake.coords ;
        
        var orientation;
        
        if((theCoords[0][0] == theCoords[1][0]) && (theCoords[0][1] == theCoords[1][1] + 1)) //going down
            orientation="d";
        else if((theCoords[0][0] == theCoords[1][0]) && (theCoords[0][1] == theCoords[1][1] - 1))//going up
            orientation="u";
        else if((theCoords[0][0] == theCoords[1][0] - 1) && (theCoords[0][1] == theCoords[1][1]))//going left
            orientation="l";
        else if((theCoords[0][0] == theCoords[1][0] + 1) && (theCoords[0][1] == theCoords[1][1]))//going right
            orientation="r";
            
        return !((orientation == "u" && new_direction == "d") ||(orientation == "d" && new_direction == "u")||(orientation == "l" && new_direction == "r")||(orientation == "r" && new_direction == "l"));
    }
    
    function comparePos(p1, p2) {
        if((typeof p1 == "undefined") || (typeof p2 == "undefined"))
            return false;
        return (p1[0] == p2[0]) && (p1[1] == p2[1]);
    }
    
    this.load = function(s, b, c, g, a) {
        snakes = s;
        bonus = b;
        counter = c;
    };
    
    
    this.update = function (callback) {     // This is where the magic happens
        counter++;
        updatePosition();
        checkCollision();
        
        while (to_kill.length > 0){
            var tokill = to_kill.pop();
            that.killSnake(tokill[0], tokill[1]);
        }
        
        checkBonus();
        game_history.unshift({snakes : snakes, bonus: bonus});
        while (game_history.length > 20){
            game_history.pop();
        }
        while (action_history.length > 20){
            action_history.pop();
        }
        if ((typeof callback === "undefined") || (callback === true)){
            update_callback(snakes, bonus, counter, game_history, action_history);
        }
    };
    
    this.seek = function(to){
        if (to == counter) {
            return;
        } else if (to > counter){ // TODO : A simplifier
            console.log("Server was early, going to " + to + ". Was at " + counter);
            for (var f = counter ; f <= to ; f++){
                for (var g in action_history){
                    if (action_history[g].counter == f){
                        that.changeDirection(action_history[g].id, action_history[g].direction);
                    }
                }
                if (f < to) {
                    that.update(false);
                }
            }
        } else {
            console.log("Server was late, going to " + to + ". Was at " + counter);
            //var max = counter;
            console.log(game_history);
            that.load(game_history[counter-to].snakes, game_history[counter-to].bonus, to);
            //for (var i = to ; i < max ; i++){
                for (var j in action_history){
                    if (action_history[j].counter == to){
                        that.changeDirection(action_history[j].id, action_history[j].direction);
                    }
                }
                //that.update(false);
            //}
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