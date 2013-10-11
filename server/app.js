var sio = require('socket.io'),
    uuid = require('uuid'),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js"),
    logentries = require('node-logentries'),
    http = require('http'),
    express = require('express');


var log = logentries.logger({
  token:process.env.LOGENTRIES_TOKEN
});

var app = express();

app.use(express.static(__dirname + '/../client'));
app.use('/common', express.static(__dirname + '/../common'));
console.log(__dirname + '/../client');


var server = http.createServer(app)

server.listen(parseInt(process.env.PORT, 10));

var io = sio.listen(server);


log.info("Starting App");

var game = {}, directions = ["u", "d", "l", "r"];
var probability_matrix;

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
            var coord = [];
            coord [0] = probx[index];
            coord [1] = proby[index];
            console.log("adding bonus at ["+coord[0]+","+coord[1]+"]");
            return coord;
        }
    }
}

/// Met à jour la matrice des probabilités pour un snake positionné en (x,y) et dirigé vers direction.
function update_probs(x, y, direction) {
    var void_radius = 2;
    var max_val     = 5;
    for(var px = x - max_val*2 + 1 - void_radius + 1; px <= x-void_radius; px++) {
        for(var py = y - max_val*2 + 1; py <= y; py++) {
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
                if(Math.random() < 0.05) {
                    var id = uuid.v4();
                    controller.addBonus(id, genBonusCoords());
                }
            }
            //log.info("Game updated");
        },
        eaten_bonnus: function (id, by) {
            io.sockets.emit("-b", [id]);
        },
        add_points: function (id, score) {
            io.sockets.emit("s", [id, score]);
        },
        add_bonus: function (id, coords) {
            io.sockets.emit("+b", [id, coords]);
        },
        add_snake: function (id, coords, direction, score, size) {
            io.sockets.emit("+", [id, coords, direction, score, size]);
        },
        killed_snake: function (id) {
            io.sockets.emit("-", id);
            //dbcontroller.push_score(id, game.snakes[id].score);
        },
        change_direction: function (id, direction) {
            io.sockets.emit("c", [id, direction]);
        }
    },
    points_bonnus: 10,
    update_rate: 15
});


/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        dbcontroller.add_player_if_not_exists(data.secret, function () {
            var snake_coords = [[0,0]];
            var snake_direction = "u";
            var snake_score = 0;
            var snake_size = 20;
            var id = uuid.v4();
            
            socket.set("login", {"id": id, "secret" : data}, function () {
                ack(id);
            });
            
            socket.on("spawn", function(data, ack){
                socket.get("login", function(err, login){
                    if (data.secret === login.secret){
                        controller.addSnake(data.id, snake_coords, snake_direction, snake_score, snake_size);
                        ack("ok");
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
                //dbcontroller.push_score(id, game.snakes[id].score);
            });
            
        });
    });
});

setInterval(function(){
    io.sockets.emit("up", game, function(){
        
    });
}, 5000);     // Sends the whole game state to all the clients every 10 seconds

//log.info("All started");
