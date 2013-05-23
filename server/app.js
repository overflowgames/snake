var io = require('socket.io').listen(parseInt(process.env.PORT, 10)),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js");

var game = {};
var controller = new Controller({
    callbacks: {
        update: function (snakes, bonus) {
            game.snakes = snakes;
            game.bonus = bonus;
        },
        eaten_bonnus: function (id) {
            
        },
        add_points: function (id, score) {
            dbcontroller.set_score(id, score);
        },
        add_bonus: function (id, coords) {
            
        }        
    },
    points_bonnus: 10,
    update_rate: 5
});

io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        if (typeof game.snakes[data.id] === "undefined"){
            
            socket.broadcast.emit("+", data.id);
            
            socket.set("login", [data.id, data.secret], function () {
                ack("k");
            });
            
            controller.addSnake(data.id, [[0,0], [0, 1], [0, 2]], "u", 0);
            
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
            });
            
        } else {
            ack("ko");
        }
    });
});

/*        if (Math.random() < ((-Math.abs(1/num_snakes)) + 1) ){
            var id = uuid.v4();
            this.addBonnus(id, genBonnusCoords());
        }*/
