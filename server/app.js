var sio = require('socket.io'),
    uuid = require('uuid'),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js"),
    http = require('http'),
    express = require('express');



var app = express();

app.use(express.static(__dirname + '/../client'));
app.use('/common', express.static(__dirname + '/../common'));
console.log(__dirname + '/../client');


var server = http.createServer(app);

server.listen(parseInt(process.env.PORT, 10));

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
        if(currentSnake.coords == undefined) {
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
            while (ecc < sum) {
                var coord = [];
                coord [0] = probx[index];
                coord [1] = proby[index];
                
                if(!surunserpent(coord)) {
                console.log("adding bonus at ["+coord[0]+","+coord[1]+"]");
                    return coord;
                }
                ecc++;
            }    
        }
    }
}

function surunserpent(coord) {
    for(var i in game.snakes) {
        for(var j in game.snakes[i].coords) {
            if(typeof game.snakes[i].coords[j] != 'undefined') {
                sx = game.snakes[i].coords[j][0];
                sy = game.snakes[i].coords[j][1];
                if(sx == coord[0] && sy == coord[1])
                    return true;
            }
                
        }
    }
    return false;
}

/// Met à jour la matrice des probabilités pour un snake positionné en (x,y) et dirigé vers direction.
function update_probs(x, y, direction) {
    
    if(direction === "u" || direction === "d") {
        for(var px = x - max_val*2 + 1 - void_radius + 1; px <= x + max_val*2 - 1 + void_radius - 1; px++) {
            if(px <= x - void_radius || px >= x + void_radius) {
                if(direction === "u") {
                    for(var py = y - max_val*2 + 1; py <= y; py++) {
                        matrix_pos(x,y,px,py);
                    }
                } else {
                    for(var py = y; py <= y + max_val*2 - 1; py++) {
                        matrix_pos(x,y,px,py);
                    }
                }
            }
        }
    } else {
        for(var py = y - max_val*2 + 1 - void_radius + 1; py <= y + max_val*2 - 1 + void_radius - 1; py++) {
            if(py <= y - void_radius || px >= y + void_radius) {
                if(direction === "l") {
                    for(var px = x - max_val*2 + 1; px <= x; px++) {
                        matrix_pos(x,y,px,py);
                    }
                } else {
                    for(var px = x ; px <= x + max_val*2 - 1; px++) {
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
        if(probability_matrix[px] == undefined)
            probability_matrix[px] = [];
            
        if(probability_matrix[px][py] == undefined)
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
            io.sockets.emit("u");
            
    
            if (controller.getNumSnakes() > 0){
                
              //  if (Math.random() < ((-Math.abs(1 / controller.getNumSnakes())) + 1)) {
                if(Math.random() < 0.02*controller.getNumSnakes()) {
                    var id = uuid.v4();
                    controller.addBonus(id, genBonusCoords());
                    
                    bonusTimeoutQueue.push([id, new Date().getTime()]);
                }
                
               
            }
            do {
                var continuer = false;
                if(bonusTimeoutQueue.length > 0) {
                    var firstBonus = bonusTimeoutQueue[0];
                    if(new Date().getTime()-firstBonus[1] > 15000) {
                        continuer = true;
                        bonusTimeoutQueue.shift();
                        controller.eatBonus(firstBonus[0],-1);
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
        add_bonus: function (id, coords) {
            io.sockets.emit("+b", [id, coords]);
        },
        add_snake: function (id, coords, direction, score, size, name) {
            io.sockets.emit("+", [id, coords, direction, score, size, name]);
        },
        killed_snake: function (id, score, by) {
            io.sockets.emit("-", [id, by]);
            dbcontroller.push_score(secrets[id], score);
        },
        change_direction: function (id, direction) {
            io.sockets.emit("c", [id, direction]);
        }
    },
    points_bonnus: 10,
    update_rate: 10
});


/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        dbcontroller.add_player_if_not_exists(data.secret, function (score) {
            var snake_coords = [[0,0]];
            var snake_direction = "u";
            var snake_score = 0;
            var snake_cum_score = score;
            var snake_size = 20;
            var id = uuid.v4();
            
            secrets[id] = data.secret;
            
            socket.set("login", {"id": id, "secret" : data.secret}, function () {
                ack(id);
            });
            
            socket.on("spawn", function(data, ack){
                socket.get("login", function(err, login){
                    data.pos[0][0] = parseInt(data.pos[0][0], 10) + parseInt((Math.random() - 0.5)*80, 10);
                    data.pos[0][1] = parseInt(data.pos[0][1], 10) + parseInt((Math.random() - 0.5)*80, 10);
                    snake_coords = data.pos;
                    snake_direction = "u";
                    if (data.secret === login.secret){
                        controller.addSnake(data.id, snake_coords, snake_direction, snake_score, snake_size, data.name, snake_cum_score);
                        ack(data.pos);
                    } else {
                        ack("ko");
                    }
                });
            });

            socket.on("c", function(data, ack) {
                if (directions.indexOf(data.direction) !== -1){
                    socket.get("login", function (err, login) {
                        if (data.secret === login.secret){
                            controller.changeDirection(login.id, data.direction);
                            ack("ok");
                        } else {
                            ack("kol");
                           //log.notice("Someone has tried to acces to an id without permission");
                        }
                    });
                } else {
                    ack("kod");
                    //log.notice("Someone has tried make the snake move on a bad direction : " + data.direction);
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
    io.sockets.emit("up", game, function(){
        
    });
}, 5000);     // Sends the whole game state to all the clients every 10 seconds

//log.info("All started");
