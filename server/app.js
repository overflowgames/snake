/*jslint node: true*/
var sio = require('socket.io'),
    uuid = require('node-uuid'),
    Controller = require('../common/controller/controller.js').Controller,
    dbcontroller = require("./db.js"),
    http = require('http'),
    fs = require('fs'),
    zlib = require("zlib"),
    ua = require('mobile-agent');

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

function surunserpent(coord) {
    'use strict';
    var i, j, sx, sy;
    for (i in game.snakes) {
        if (game.snakes.hasOwnProperty(i)) {
            for (j = 0; j < game.snakes[i].coords.length; j += 1) {
                if (game.snakes[i].coords[j + 1] !== undefined) {
                    sx = game.snakes[i].coords[j][0];
                    sy = game.snakes[i].coords[j][1];
                    if (((coord[0] >= Math.min(sx, game.snakes[i].coords[j + 1][0])) && (coord[0] <= Math.max(sx, game.snakes[i].coords[j + 1][0])) && (sy === coord[1])) || ((coord[1] >= Math.min(sy, game.snakes[i].coords[j + 1][1])) && (coord[1] <= Math.max(sy, game.snakes[i].coords[j + 1][1])) && (sx === coord[0]))) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function surunbonus(coord) {
    'use strict';
    var i;
    for (i in game.bonus) {
        if (game.bonus.hasOwnProperty(i)) {
            if (game.bonus[i][1][0] === coord[0] && game.bonus[i][1][1] === coord[1]) {
                return true;
            }
        }
    }
    return false;
}

/// Calcule la probabilité pour le point (x,y) à partir d'un snake (px,py)
function matrix_pos(x, y, px, py, probability_matrix) {
    'use strict';

    var delta_total = Math.abs(x - px) + Math.abs(y - py),
        max_val = 5;

    if (delta_total > max_val) {
        delta_total = 2 * max_val - delta_total;
    }

    if ((delta_total > 0) && (delta_total <= max_val)) {
        if (probability_matrix[px] === undefined) {
            probability_matrix[px] = [];
        }

        if (probability_matrix[px][py] === undefined) {
            probability_matrix[px][py] = 0;
        }

        probability_matrix[px][py] += delta_total;
    }
    return probability_matrix;
}
/// Met à jour la matrice des probabilités pour un snake positionné en (x,y) et dirigé vers direction.
function update_probs(x, y, direction, probability_matrix) {
    'use strict';
    var void_radius = 2,
        max_val = 5,
        px,
        py;

    if (direction === "u" || direction === "d") {
        for (px = x - max_val * 2 + 1 - void_radius + 1; px <= x + max_val * 2 - 1 + void_radius - 1; px += 1) {
            if (px <= x - void_radius || px >= x + void_radius) {
                if (direction === "u") {
                    for (py = y - max_val * 2 + 1; py <= y; py += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                } else {
                    for (py = y; py <= y + max_val * 2 - 1; py += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                }
            }
        }
    } else {
        for (py = y - max_val * 2 + 1 - void_radius + 1; py <= y + max_val * 2 - 1 + void_radius - 1; py += 1) {
            if (py <= y - void_radius || px >= y + void_radius) {
                if (direction === "l") {
                    for (px = x - max_val * 2 + 1; px <= x; px += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                } else {
                    for (px = x; px <= x + max_val * 2 - 1; px += 1) {
                        probability_matrix = matrix_pos(x, y, px, py, probability_matrix);
                    }
                }
            }
        }
    }
    return probability_matrix;
}

function genBonusCoords() {
    'use strict';
    var i,
        currentSnake,
        probability_matrix = [],
        sum = 0, // Somme des probabilités
        probs = [], // Probabilité à l'index i
        probx = [], // Position x de la probabilité à l'index i
        proby = [], // Position y de la probabilité à l'index i
        x,
        y,
        r,
        ecc = 0,
        index,
        coord;

    /*
     * Génération du tableau des probabilités.
     */
    for (i in game.snakes) {
        if (game.snakes.hasOwnProperty(i)) {
            currentSnake = game.snakes[i];
            if (currentSnake.coords === undefined) {
                console.log("yolo");
            } else {
                console.log("yea");
                probability_matrix = update_probs(currentSnake.coords[0][0], currentSnake.coords[0][1], currentSnake.direction, probability_matrix);
            }
        }
    }

    /*
     * Préparation du traitement des probabilités.
     */


    for (x in probability_matrix) {
        if (probability_matrix.hasOwnProperty(x)) {
            for (y in probability_matrix[x]) {
                if (probability_matrix[x].hasOwnProperty(y)) {
                    sum += probability_matrix[x][y];
                    probs.push(probability_matrix[x][y]);
                    probx.push(x);
                    proby.push(y);
                }
            }
        }
    }

    /*
     * Sélection d'une coordonnée aléatoire selon les probabilités.
     */

    r = Math.ceil(Math.random() * sum);

    console.log("sum = " + sum + " ; random = " + r);

    for (index = 0; index < probs.length; index += 1) {
        ecc += probs[index];
        if (ecc >= r) {
            coord = [parseInt(probx[index], 10), parseInt(proby[index], 10)];

            if (!surunserpent(coord) && !surunbonus(coord)) {
                console.log("adding bonus at [" + coord[0] + "," + coord[1] + "]");
                return coord;
            }
        }
    }
    console.log("Les coordonées n'ont pas été trouvées");
}


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
                    controller.addBonus(id, genBonusCoords(), type);

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
