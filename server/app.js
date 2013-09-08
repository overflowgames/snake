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

function genBonusCoords (){
    
}


/* ---------------------------- Creating controller ---------------------------- */

var controller = new Controller({
    callbacks: {
        update: function (snakes, bonus) {
            if (controller.getNumSnakes() > 0){
                if (Math.random() < ((-Math.abs(1 / controller.getNumSnakes())) + 1)) {
                    var id = uuid.v4();
                    controller.addBonus(id, genBonusCoords());
                }
            }
            game.snakes = snakes;
            game.bonus = bonus;
            log.info("Game updated");
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
            io.sockets.broadcast.emit("-", id);
            dbcontroller.push_score(id, game.snakes[id].score);
        },
        change_direction: function (id, direction) {
            io.sockets.broadcast.emit("chdir", [id, direction]);
        }
    },
    points_bonnus: 10,
    update_rate: 5
});


/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        dbcontroller.add_player_if_not_exists(data.secret, function () {
            var snake_coords = [[0,0], [0, 1], [0, 2]];
            var snake_direction = "u";
            var snake_score = 0;
            var snake_size = snake_coords.length;
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
                        
            socket.on("chdir", function(data, ack) {
                if (directions.indexOf(data.direction) !== -1){
                    socket.get("login", function (err, login) {
                        if (data.secret === login.secret){
                            controller.changeDirection(login.id, data.direction);
                            ack("ok");
                        } else {
                            ack("kol");
                            log.notice("Someone has tried to acces to an id without permission");
                        }
                    });
                } else {
                    ack("kod");
                    log.notice("Someone has tried make the snake move on a bad direction : " + data.direction);
                }
            });
                
            socket.on("disconnect", function () {
                socket.broadcast.emit("-", id);
                dbcontroller.push_score(id, game.snakes[id].score);
            });
            
        });
    });
});

setInterval(function(){
    io.sockets.emit("up", game);
}, 100000);     // Sends the whole game state to all the clients every 10 seconds

log.info("All started");
