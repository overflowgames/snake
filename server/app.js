/*jslint node: true*/

var sio = require('socket.io'),
    uuid = require('node-uuid'),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js"),
    http = require('http'),
    fs = require('fs'),
    zlib = require("zlib"),
    ua = require('mobile-agent'),
    genBonusCoords = require("./bonus.js").genBonusCoords;

var server = http.createServer(function (request, response) {
    'use strict';
    var filename = "index.html",
        encoding = "identity",
        acceptEncoding = request.headers['accept-encoding'],
        raw;

    if (request.headers["user-agent"] !== undefined) {
        if (ua(request.headers["user-agent"]).Mobile) {
            filename = "mobile.html";
        }
    }

    if (!acceptEncoding) {
        acceptEncoding = '';
    }

    /*jslint nomen: true */
    raw = fs.createReadStream(__dirname + '/../client/' + filename);
    /*jslint nomen: false */

    if (acceptEncoding.match(/\bgzip\b/)) {
        encoding =  'gzip';
        raw = raw.pipe(zlib.createGzip());
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
        encoding = "deflate";
        raw = raw.pipe(zlib.createDeflate());
    }

    if (request.url === '/') {
        response.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'max-age=' + 86400000 * 7,
            'content-encoding': encoding
        });
        raw.pipe(response);
    } else {
        response.writeHead(404);
        response.end();
    }
});

server.listen(parseInt(process.env.PORT || 1337, 10));

var io = sio.listen(server);
io.set('log level', 1);
io.disable("browser client");

var secrets = [],
    game = {},
    bonusTimeoutQueue = [];

/* ---------------------------- Creating controller ---------------------------- */

var controller = new Controller({
    callbacks: {
        update: function (snakes, bonus) {
            'use strict';

            game.snakes = snakes;
            game.bonus = bonus;

            var continuer, firstBonus, id, type;

            if (controller.getNumSnakes() > 0) {
                if (Math.random() < 0.02 * controller.getNumSnakes()) {
                    id = uuid.v4();
                    type = Math.round(Math.random());
                    controller.addBonus(id, genBonusCoords(snakes, bonus), type);

                    bonusTimeoutQueue.push([id, new Date().getTime()]);
                }
            }

            do {    // A implémenter dans le controlleur, sinon le client veut pas ..."
                continuer = false;
                if (bonusTimeoutQueue.length > 0) {
                    firstBonus = bonusTimeoutQueue[0];
                    if (new Date().getTime() - firstBonus[1] > 15000) {
                        continuer = true;
                        bonusTimeoutQueue.shift();
                        controller.eatBonus(firstBonus[0]);
                    }
                }
            } while (continuer);
        },
        eaten_bonnus: function (id, by) {
            'use strict';
            io.sockets.emit("-b", [id, by]);
        },
        add_points: function (id, score) {
            'use strict';
            io.sockets.emit("s", [id, score]);
        },
        add_bonus: function (id, coords, type) {
            'use strict';
            io.sockets.emit("+b", [id, coords, type]);
        },
        add_snake: function (id, coords, direction, score, size, name, cum_score, speedup) {
            'use strict';
            io.sockets.emit("+", [id, coords, direction, score, size, name, cum_score, speedup]);
        },
        killed_snake: function (id, score, by) {
            'use strict';
            io.sockets.emit("-", [id, by]);
            dbcontroller.push_score(secrets[id], score);
        },
        change_direction: function (id, direction, pos) {
            'use strict';
            io.sockets.emit("c", [id, direction, pos]);
        }
    },
    points_bonus: 10,
    update_rate: 10
});


/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
    'use strict';
    socket.on("spawn", function (data, ack) {
        if (typeof ack !== "function" || data.secret === undefined || data.pos === undefined) {
            return;
        }
        dbcontroller.add_player_if_not_exists(data.secret, function (score) {
            var snake_coords,
                snake_direction = "u",
                snake_score = 0,
                snake_speedup = 0,
                snake_high_score = score,
                snake_size = 20,
                id = uuid.v4();

            secrets[id] = data.secret;

            socket.set("login", {"id": id, "secret" : data.secret}, function () {
                data.pos[0] = [parseInt(data.pos[0][0], 10) + parseInt((Math.random() - 0.5) * 80, 10), parseInt(data.pos[0][1], 10) + parseInt((Math.random() - 0.5) * 80, 10)];
                snake_coords = [[data.pos[0][0], data.pos[0][1]], [data.pos[0][0], data.pos[0][1]]];

                if (controller.addSnake(id, snake_coords, snake_direction, snake_score, snake_size, data.name, snake_high_score, snake_speedup)) {
                    ack(id);
                } else {
                    ack("ko");
                }
            });
        });

        socket.on("c", function (data, ack) {
            if (data.direction === undefined || data.secret === undefined) {
                return;
            }
            socket.get("login", function (err, login) {
                if (!err) {
                    if (data.secret === login.secret) {
                        if (controller.changeDirection(login.id, data.direction) && typeof ack === "function") {
                            ack("ok");
                        }
                    } else {
                        if (typeof ack === "function") {
                            ack("ko");
                        }
                    }
                }
            });
        });

        socket.on("confirm_death", function (data, ack) {
            if (typeof ack !== "function" || data.id === undefined) {
                return;
            }
            if (game.snakes[data.id] === undefined) {
                ack(false);
            } else {
                ack(game.snakes);
            }
        });

        socket.on("disconnect", function () {
            socket.get("login", function (err, login) {
                if (!err) {
                    socket.broadcast.emit("-", login.id);
                    controller.killSnake(login.id);
                }
            });
        });
    });
    socket.emit("up", {game: game});
});

setInterval(function () {
    'use strict';
    io.sockets.emit("up", {game: game});
}, 10000);     // Sends the whole game state to all the clients every 10 seconds
