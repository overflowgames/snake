var io = require('socket.io').listen(parseInt(process.env.PORT, 10)),
    uuid = require('uuid'),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js");

var game = {};
var controller = new Controller({
    callbacks: {
        update: function (controller, snakes, bonus) {
            if (Math.random() < ((-Math.abs(1 / controller.getNumSnakes())) + 1)) {
                var id = uuid.v4();
                controller.addBonus(id, genBonusCoords());
            }
            game.snakes = snakes;
            game.bonus = bonus;
        },
        eaten_bonnus: function (id) {
            io.sockets.emit("-b", [id]);
        },
        add_points: function (id, score) {
            dbcontroller.set_score(id, score);
        },
        add_bonus: function (id, coords) {
            io.sockets.emit("+b", [id, coords]);
        },
        add_snake: function (id, coords, direction, score, size) {
            
        },
        killed_snake: function (id) {
            socket.broadcast.emit("-", data.id);
            dbcontroller.push_score(data.id, data.secret, game.snakes[data.id].score);
        }
    },
    points_bonnus: 10,
    update_rate: 5
});

io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        if (typeof game.snakes[data.id] === "undefined"){
            
            var snake_coords = [[0,0], [0, 1], [0, 2]];
            var snake_direction = "u";
            var snake_score = 0;
            var snake_size = snake_coords.length;
            
            socket.broadcast.emit("+", [data.id, snake_coords, snake_direction, snake_score, snake_size]);
            controller.addSnake(data.id, snake_coords, snake_direction, snake_score, snake_size);
            
            socket.set("login", [data.id, data.secret], function () {
                ack("k");
            });
                        
            socket.on("chdir", function(data, ack) {
                socket.get("login", function (err, login) {
                    if (data.secret == login.secret){
                        controller.changeDirection(login.id, data.direction);
                        socket.broadcast.emit("chdir", [login.id, data.direction]);
                        ack("ok");
                    } else {
                        ack("kol");
                    }
                });
            });
            
            socket.on("disconnect", function () {
                socket.broadcast.emit("-", data.id);
                dbcontroller.push_score(data.id, data.secret, game.snakes[data.id].score);
            });
            
        } else {
            ack("ko");
        }
    });
});

setInterval(function(){
    io.sockets.emit("up", game);
}, 100000);
