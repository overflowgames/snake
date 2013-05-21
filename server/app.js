var io = require('socket.io').listen(parseInt(process.env.PORT, 10));

io.sockets.on('connection', function (socket) {
    socket.broadcast.emit("+");
    socket.on("disconnect", function () {
        socket.broadcast.emit("-");
    });
});

/*        if (Math.random() < ((-Math.abs(1/num_snakes)) + 1) ){
            var id = uuid.v4();
            this.addBonnus(id, genBonnusCoords());
        }*/
