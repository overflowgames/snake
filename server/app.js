var io = require('socket.io').listen(parseInt(process.env.PORT));

io.sockets.on('connection', function (socket) {
    socket.broadcast.emit("+");
    socket.on("disconnect", function () {
        socket.broadcast.emit("-")
    });
});