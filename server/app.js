var sio = require('socket.io'),
    uuid = require('node-uuid'),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js"),
    http = require('http'),
    express = require('express');

var app = express();
var oneDay = 86400000;

app.use(express.static(__dirname + '/../client', { maxAge: oneDay*7 }));
app.use('/common', express.static(__dirname + '/../common', { maxAge: oneDay*7 }));
console.log(__dirname + '/../client');


var server = http.createServer(app);

server.listen(parseInt(process.env.PORT || 1337, 10));

var io = sio.listen(server);
io.set('log level', 1);

var secrets = [];

var game = {}, directions = ["u", "d", "l", "r"];
var probability_matrix;

var void_radius = 2;
var max_val     = 5;

var bonusTimeoutQueue = [];

function genBonusCoords (){
    
    /*
     * Génération du tableau des probabilités.
     */
    
    probability_matrix = [];
    for(var i in game.snakes) {
        var currentSnake = game.snakes[i];
        if(typeof currentSnake.coords === "undefined") {
            console.log("yolo");
        } else {
            console.log("yea");
            update_probs(currentSnake.coords[0][0], currentSnake.coords[0][1], currentSnake.direction);
        }
    }
    
    /*
     * Préparation du traitement des probabilités. 
     */
    
    var sum = 0; // Somme des probabilités
    var probs = []; // Probabilité à l'index i
    var probx = []; // Position x de la probabilité à l'index i
    var proby = []; // Position y de la probabilité à l'index i
    
    for (var x in probability_matrix) {
        for (var y in probability_matrix[x]) {
            sum += probability_matrix[x][y];
            probs.push(probability_matrix[x][y]);
            probx.push(x);
            proby.push(y);
        }
    }
    
    /*
     * Sélection d'une coordonnée aléatoire selon les probabilités.
     */ 
     
    var r = Math.ceil(Math.random()*sum);
    var ecc = 0;
    
    console.log("sum = "+sum+" ; random = "+r);
    
    for(var index in probs) {
        ecc += probs[index];
        if(ecc >= r) {
            var coord = [parseInt(probx[index], 10), parseInt(proby[index], 10)];

            if(!surunserpent(coord) && !surunbonus(coord)) {
                console.log("adding bonus at ["+coord[0]+","+coord[1]+"]");
                return coord;
            }
        }
    }
    console.log("Les coordonées n'ont pas été trouvées");
}

function surunserpent(coord) {
    for(var i in game.snakes) {
        for(var j in game.snakes[i].coords) {
            j = parseInt(j, 10);
            if(typeof game.snakes[i].coords[j+1] !== 'undefined') {
                var sx = game.snakes[i].coords[j][0];
                var sy = game.snakes[i].coords[j][1];
                if(((coord[0] >= Math.min(sx, game.snakes[i].coords[j+1][0])) && (coord[0] <= Math.max(sx, game.snakes[i].coords[j+1][0])) && (sy == coord[1])) || ((coord[1] >= Math.min(sy, game.snakes[i].coords[j+1][1])) && (coord[1] <= Math.max(sy, game.snakes[i].coords[j+1][1])) && (sx == coord[0]))){
                    return true;
                }
            }
        }
    }
    return false;
}

function surunbonus(coord){
    for(var i in game.bonus){
        if (game.bonus[i][1][0] == coord[0] && game.bonus[i][1][1] == coord[1]){
            return true;
        }
    }
    return false;
}

/// Met à jour la matrice des probabilités pour un snake positionné en (x,y) et dirigé vers direction.
function update_probs(x, y, direction) {
    var px, py;
    if(direction === "u" || direction === "d") {
        for(px = x - max_val*2 + 1 - void_radius + 1; px <= x + max_val*2 - 1 + void_radius - 1; px++) {
            if(px <= x - void_radius || px >= x + void_radius) {
                if(direction === "u") {
                    for(py = y - max_val*2 + 1; py <= y; py++) {
                        matrix_pos(x,y,px,py);
                    }
                } else {
                    for(py = y; py <= y + max_val*2 - 1; py++) {
                        matrix_pos(x,y,px,py);
                    }
                }
            }
        }
    } else {
        for(py = y - max_val*2 + 1 - void_radius + 1; py <= y + max_val*2 - 1 + void_radius - 1; py++) {
            if(py <= y - void_radius || px >= y + void_radius) {
                if(direction === "l") {
                    for(px = x - max_val*2 + 1; px <= x; px++) {
                        matrix_pos(x,y,px,py);
                    }
                } else {
                    for(px = x ; px <= x + max_val*2 - 1; px++) {
                        matrix_pos(x,y,px,py);
                    }
                }
            }
        }
    }
}

/// Calcule la probabilité pour le point (x,y) à partir d'un snake (px,py)
function matrix_pos(x, y, px, py) {
    var delta_total = Math.abs(x - px) + Math.abs(y - py);
    
    if(delta_total > max_val)
        delta_total = 2*max_val - delta_total;
    
    if((delta_total > 0) && (delta_total <= max_val)){
        if(probability_matrix[px] === undefined)
            probability_matrix[px] = [];
            
        if(probability_matrix[px][py] === undefined)
            probability_matrix[px][py] = 0;
            
        probability_matrix[px][py] += delta_total;
    }
}

/* ---------------------------- Creating controller ---------------------------- */

var controller = new Controller({
    callbacks: {
        update: function (snakes, bonus) {
            game.snakes = snakes;
            game.bonus = bonus;

    
            if (controller.getNumSnakes() > 0){
                
                if(Math.random() < 0.02*controller.getNumSnakes()) {
                    var id = uuid.v4();
                    var type = Math.round(Math.random());
                    controller.addBonus(id, genBonusCoords(), type);

                    bonusTimeoutQueue.push([id, new Date().getTime()]);
                }
                
               
            }
            var continuer;
            do {    // TODO : A implémenter dans le controlleur, sinon le client veut pas ..."
                continuer = false;
                if(bonusTimeoutQueue.length > 0) {
                    var firstBonus = bonusTimeoutQueue[0];
                    if(new Date().getTime()-firstBonus[1] > 15000) {
                        continuer = true;
                        bonusTimeoutQueue.shift();
                        controller.eatBonus(firstBonus[0]);
                    }
                } 
            } while(continuer);
        },
        eaten_bonnus: function (id, by) {
            io.sockets.emit("-b", [id, by]);
        },
        add_points: function (id, score) {
            io.sockets.emit("s", [id, score]);
        },
        add_bonus: function (id, coords, type) {
            io.sockets.emit("+b", [id, coords, type]);
        },
        add_snake: function (id, coords, direction, score, size, name, cum_score, speedup) {
            io.sockets.emit("+", [id, coords, direction, score, size, name, cum_score, speedup]);
        },
        killed_snake: function (id, score, by) {
            io.sockets.emit("-", [id, by]);
            dbcontroller.push_score(secrets[id], score);
        },
        change_direction: function (id, direction, pos) {
            io.sockets.emit("c", [id, direction, pos]);
        }
    },
    points_bonnus: 10,
    update_rate: 10
});


/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        dbcontroller.add_player_if_not_exists(data.secret, function (score) {
            var snake_coords = [[0,0], [0,0]];
            var snake_direction = "u";
            var snake_score = 0;
            var snake_speedup = 0;
            var snake_cum_score = score;
            var snake_size = 20;
            var id = uuid.v4();
            
            secrets[id] = data.secret;
            
            socket.set("login", {"id": id, "secret" : data.secret}, function () {
                ack(id);
            
                socket.on("spawn", function(data, ack){
                    if (typeof ack !== "function"){
                        return;
                    }
                    socket.get("login", function(err, login){
                        data.pos[0] = [parseInt(data.pos[0][0], 10) + parseInt((Math.random() - 0.5)*80, 10), parseInt(data.pos[0][1], 10) + parseInt((Math.random() - 0.5)*80, 10)];
                        snake_coords = [[data.pos[0][0], data.pos[0][1]], [data.pos[0][0], data.pos[0][1]]];
                        snake_direction = "u";
                        if (data.secret === login.secret){
                            controller.addSnake(data.id, snake_coords, snake_direction, snake_score, snake_size, data.name, snake_cum_score, snake_speedup);
                            ack(snake_coords);
                        } else {
                            ack("ko");
                        }
                    });
                });
            });

            socket.on("c", function(data, ack) {
                if (typeof ack !== "function"){
                    console.log("No ack provided");
                    return;
                }
                if (directions.indexOf(data.direction) !== -1){
                    socket.get("login", function (err, login) {
                        if (data.secret === login.secret){
                            controller.changeDirection(login.id, data.direction);
                            ack("ok");
                        } else {
                            ack("kol");
                        }
                    });
                } else {
                    ack("kod");
                }
            });
            
            socket.on("confirm_death", function(data, ack){
                if (typeof ack !== "function"){
                    return;
                }
                if (typeof game.snakes[data.id] === "undefined"){
                    ack(false);
                } else {
                    ack(game.snakes);
                }
            });
                
            socket.on("disconnect", function () {
                socket.broadcast.emit("-", id);
                controller.killSnake(id);
            });
            
        });
    });
});

setInterval(function(){
    io.sockets.emit("up", {game: game}, function(){
        
    });
}, 10000);     // Sends the whole game state to all the clients every 10 seconds

