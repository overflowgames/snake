var io = require('socket.io').listen(parseInt(process.env.PORT, 10)),
    Controller = require('../common/controller/controller.js').Controller;


io.sockets.on('connection', function (socket) {
    socket.on("login", function(data, ack) {
        socket.broadcast.emit("+", data.id);
        
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
        }); 
    });
});

/*        if (Math.random() < ((-Math.abs(1/num_snakes)) + 1) ){
            var id = uuid.v4();
            this.addBonnus(id, genBonnusCoords());
        }*/
