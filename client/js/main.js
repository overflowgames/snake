/*jslint browser: true */
var controller,
    socket,
    zoom = 1,
    context,
    canvas,
    secret,
    pattern,
    triangle_canvas,
    position_x = -145,
    position_y = -145,
    offset_x = 0,
    offset_y = 0,
    height = 500,
    width = 500,
    sq_w = 10,
    anim,
    my_id = "",
    last_snakes,
    last_bonus,
    spawned = false,
    my_score = 0,
    nconnectes = 0,
    locked = true;

function draw_grid() {
    'use strict';
    var x,
        y;

    for (x = (-position_x + offset_x) % sq_w; x <= width; x += sq_w) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
    }

    for (y = (-position_y + offset_y) % sq_w; y <= height; y += sq_w) {
        context.moveTo(0, y);
        context.lineTo(width, y);
    }
    context.stroke();
}

function update_dimensions() {
    'use strict';
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        win_x = w.innerWidth || e.clientWidth || g.clientWidth,
        win_y = w.innerHeight || e.clientHeight || g.clientHeight;

    win_x *= zoom;
    win_y *= zoom;

    if (height === win_y && width === win_x) {
        return;
    }

    height = win_y;
    width = win_x;

    canvas.height = win_y;
    canvas.width = win_x;
}

function draw_hud() {
    'use strict';
    context.font = "18px Helvetica"; // On passe à l'attribut "font" de l'objet context une simple chaîne de caractères composé de la taille de la police, puis de son nom.
    context.fillStyle = "#ffffff";

    var cx = Math.round((position_x - offset_x + canvas.width / 2) / sq_w),
        cy = Math.round((position_y - offset_y + canvas.height / 2) / sq_w);

    context.fillText("x: " + cx, 30, 30);
    context.fillText("y: " + cy, 30, 50);
    context.fillText("score: " + my_score, 30, 70);
    context.fillText("connectés: " + nconnectes, 30, 90);
}



function draw_snakes(snakes) {
    'use strict';
    var snake_palette = ["#00ffff", "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#8000ff"],
        i,
        ii,
        ix,
        iy,
        snake_speedup,
        snake_size,
        counter,
        cxstart,
        cxend,
        cystart,
        cyend,
        swap,
        swapy,
        lvl = 0;

    // #Draw the snakes
    nconnectes = 0;

    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            nconnectes += 1;

            snake_speedup = snakes[i].speedup;
            snake_size = controller.snakeSize(i);
            counter = snakes[i].size + snakes[i].coords.length - 3;

            if (snake_speedup > snake_size) {
                lvl = Math.floor(snake_speedup / snake_size);
                snake_speedup -= snake_size;
            }

            for (ii = 0; ii < snakes[i].coords.length - 1; ii += 1) {
                cxstart = snakes[i].coords[ii][0];
                cxend = snakes[i].coords[ii + 1][0];
                swap = false;
                swapy = false;

                if (cxstart > cxend) {
                    swap = true;
                }

                cystart = snakes[i].coords[ii][1];
                cyend = snakes[i].coords[ii + 1][1];

                if (cystart > cyend) {
                    swapy = true;
                }

                for (ix = cxstart; ((ix <= cxend) && (!swap)) || ((ix >= cxend) && swap); ix += (swap ? -1 : 1)) {
                    for (iy = cystart; ((iy <= cyend) && (!swapy)) || ((iy >= cyend) && swapy); iy += (swapy ? -1 : 1)) {
                        if (snake_speedup > counter) {
                            context.fillStyle = snake_palette[lvl + 1];
                        } else {
                            context.fillStyle = snake_palette[lvl];
                        }

                        counter -= 1;
                        context.fillRect(ix * sq_w - position_x + offset_x, iy * sq_w - position_y + offset_y, sq_w, sq_w);
                    }
                }
            }
        }
    }
}

function draw_bonuses(bonus) {
    'use strict';
    var i,
        cx,
        cy;

    // #Draw bonuses
    for (i in bonus) {
        if (bonus[i] !== null) {
            cx = bonus[i][0][0];
            cy = bonus[i][0][1];

            if (bonus[i][1] === 0) {
                context.fillStyle = "#ffaa00";
            } else if (bonus[i][1] === 1) {
                context.fillStyle = "#ffaaaa";
            }

            context.fillRect(cx * sq_w - position_x + offset_x, cy * sq_w - position_y + offset_y, sq_w, sq_w);
        }
    }
}

function getDistanceFromCenter(snake) {
    'use strict';
    var sx = snake.coords[0][0],
        sy = snake.coords[0][1],
        cx = Math.round((position_x - offset_x + canvas.width / 2) / sq_w),
        cy = Math.round((position_y - offset_y + canvas.height / 2) / sq_w);

    return [sx - cx, sy - cy];
}

function visible(snake) {
    'use strict';
    var sx = snake.coords[0][0],
        sy = snake.coords[0][1],
        cx = Math.round((position_x - offset_x + canvas.width / 2) / sq_w),
        cy = Math.round((position_y - offset_y + canvas.height / 2) / sq_w),
        distx = Math.abs(cx - sx),
        disty = Math.abs(cy - sy);

    distx -= canvas.width / (2 * sq_w);
    disty -= canvas.height / (2 * sq_w);

    return (distx < 0 && disty < 0);
}

function draw_names(snakes) {
    'use strict';
    // #Draw names
    var tw = 0,
        i,
        sx,
        sy,
        tx,
        ty,
        dists,
        dx,
        dy,
        drawx,
        drawy,
        flagx,
        flagy,
        ofsx,
        ofsy,
        dist;

    for (i in snakes) {
        if (snakes.hasOwnProperty(i)) {
            dists = getDistanceFromCenter(snakes[i]);
            dx = dists[0];
            dy = dists[1];
            if (visible(snakes[i])) {
                sx = snakes[i].coords[0][0];
                sy = snakes[i].coords[0][1];

                context.fillStyle = "rgb(66, 66, 66)";
                context.font = "16px Helvetica";

                tw = context.measureText(snakes[i].name).width;

                tx = Math.round(sx * sq_w - position_x + offset_x - tw / 2);
                ty = Math.round(sy * sq_w - position_y + offset_y - sq_w * 1.5);


                context.fillRect(tx - 2, ty - 16, tw + 4, 20);

                context.fillStyle = "#ffffff";
                context.fillText(snakes[i].name, tx, ty);
            } else {
                if ((Math.abs(dx) < 600) && (Math.abs(dy) < 600)) {
                    context.font = "18px Helvetica";
                    context.fillStyle = "#ffffff";

                    dist = Math.round(Math.sqrt(dx * dx + dy * dy));
                    tw = context.measureText(dist).width;

                    if (dx < -canvas.width / (2 * sq_w)) {
                        drawx = 10;
                        flagx = -1;
                    } else if (dx > canvas.width / (2 * sq_w)) {
                        drawx = canvas.width - 20;
                        flagx = 1;
                    } else {
                        drawx = canvas.width / 2 + dx * sq_w;
                        flagx = 0;
                    }

                    if (dy < -canvas.height / (2 * sq_w)) {
                        drawy = 10;
                        flagy = -1;
                    } else if (dy > canvas.height / (2 * sq_w)) {
                        drawy = canvas.height - 30;
                        flagy = 1;
                    } else {
                        drawy = canvas.height / 2 + dy * sq_w;
                        flagy = 0;
                    }

                    context.save();
                    context.translate(drawx, drawy);

                    switch (flagx) {
                    case -1:
                        switch (flagy) {
                        case -1: // haut gauche
                            context.rotate(-Math.PI / 4);
                            ofsx = 25;
                            ofsy = 40;
                            break;
                        case 0: // gauche
                            context.rotate(-Math.PI / 2);
                            ofsx = 25;
                            ofsy = -5;
                            break;
                        case 1: // bas gauche
                            context.rotate(-3 * Math.PI / 4);
                            ofsx = 25;
                            ofsy = -25;
                            break;
                        }
                        break;
                    case 0:
                        switch (flagy) {
                        case -1: // haut
                            ofsx = 10 - tw / 2;
                            ofsy = 40;
                            break;
                        case 1: // bas
                            context.rotate(Math.PI);
                            ofsx = -10 - tw / 2;
                            ofsy = -25;
                            break;
                        }
                        break;
                    case 1:
                        switch (flagy) {
                        case -1: // haut droite
                            context.rotate(Math.PI / 4);
                            ofsx = -30 - tw;
                            ofsy = 40;
                            break;
                        case 0: // droite  
                            context.rotate(Math.PI / 2);
                            ofsx = -30 - tw;
                            ofsy = 15;
                            break;
                        case 1: // bas droite
                            context.rotate(3 * Math.PI / 4);
                            ofsx = -30 - tw;
                            ofsy = -25;
                            break;
                        }
                        break;
                    }

                    context.drawImage(triangle_canvas, 0, 0);
                    context.restore();

                    context.fillText(dist, Math.round(drawx + ofsx), Math.round(drawy + ofsy));
                }
            }
        }
    }
}

function spawn_snake() {
    'use strict';
    var pseudo = document.getElementById('daniel').value,
        c = [[Math.round((position_x + canvas.width / 2) / sq_w), Math.round((position_y + canvas.height / 2) / sq_w)]];

    localStorage.setItem("pseudo", pseudo);

    if (spawned) {
        return;
    }

    spawned = true;

    if (pseudo === "") {
        pseudo = "Jack Banane";
    }

    socket.emit("spawn", {"secret": secret, "name": pseudo, "pos": c}, function (data) {
        if (data === "ko") {
            spawned = false;
        } else {
            document.getElementById("spawndiv").className = 'hide';
            my_id = data;
        }
    });
}

function centerOnSnake(id) {
    'use strict';
    var cx = last_snakes[id].coords[0][0],
        cy = last_snakes[id].coords[0][1],
        px = cx * sq_w,
        py = cy * sq_w;

    position_x = px - width / 2;
    position_y = py - height / 2;
}

function update_canvas(snakes, bonus) {
    'use strict';
    var pattern_local = context.createPattern(pattern, "repeat"),
        offx = offset_x - position_x,
        offy = offset_y - position_y;

    update_dimensions();

    context.beginPath();

    context.fillStyle = pattern_local;

    context.translate(offx, offy);
    context.fillRect(-offx, -offy, canvas.width, canvas.height);
    context.translate(-offx, -offy);


    draw_snakes(snakes);
    draw_bonuses(bonus);

    // #Draw the grid
    context.strokeStyle = "#ffffff";

    if (window.mobile) {
        context.lineWidth = 1;
    } else {
        context.lineWidth = 0.5;
    }
    draw_grid();

    draw_names(snakes);

    if (snakes[my_id] !== undefined) {
        my_score = snakes[my_id].score;
    }

    // #Draw the HUD
    draw_hud();
}

function followSnake(id) {
    'use strict';
    if (last_snakes[id] === undefined) {
        return;
    }

    var cx = last_snakes[id].coords[0][0],
        cy = last_snakes[id].coords[0][1],
        px = cx * sq_w,
        py = cy * sq_w,
        paddingx = width / 5 - 20,
        paddingy = height / 5 - 20;

    anim = false;

    if (px < position_x) {
        centerOnSnake(id);
        return;
    }

    if (px > position_x + width) {
        centerOnSnake(id);
        return;
    }

    if (px < position_x + paddingx) {
        position_x = position_x - sq_w;
        if (px < position_x + paddingx) {
            anim = true;
        }
    } else if (px > position_x + width - paddingx) {
        position_x = position_x + sq_w;
        if (px > position_x + width - paddingx) {
            anim = true;
        }
    }

    if (py < position_y) {
        centerOnSnake(id);
        return;
    }

    if (py > position_y + height) {
        centerOnSnake(id);
        return;
    }

    if (py < position_y + paddingy) {
        position_y = position_y - sq_w;
        if (py < position_y + paddingy) {
            anim = true;
        }
    } else if (py > position_y + height - paddingy) {
        position_y = position_y + sq_w;
        if (py > position_y + height - paddingy) {
            anim = true;
        }
    }
    update_canvas(last_snakes, last_bonus);
}

function lock() {
    'use strict';
    locked = true;
    document.getElementById('button_locked').style.display = "block";
    document.getElementById('button_lock').style.display = "none";
}

function unlock() {
    'use strict';
    locked = false;
    document.getElementById('button_locked').style.display = "none";
    document.getElementById('button_lock').style.display = "block";
}

function isLocked() {
    'use strict';
    return locked;
}

window.onload = function () {
    'use strict';
    socket = window.io.connect("@@URL_SOCKETIO_SERVER");


    pattern = document.createElement('canvas');
    pattern.width = 512;
    pattern.height = 512;
    var pctx = pattern.getContext('2d'),
        gradient = pctx.createLinearGradient(0, 0, pattern.width, pattern.height),
        tctx;

    gradient.addColorStop(0, "#3B5998");
    gradient.addColorStop(1 / 4, "#4B7BC9");
    gradient.addColorStop(2 / 4, "#3B5998");
    gradient.addColorStop(3 / 4, "#4B7BC9");
    gradient.addColorStop(1, "#3B5998");
    pctx.fillStyle = gradient;
    pctx.fillRect(0, 0, pattern.width, pattern.height);


    triangle_canvas = document.createElement('canvas');
    triangle_canvas.width = 20;
    triangle_canvas.height = 20;

    tctx = triangle_canvas.getContext('2d');
    tctx.fillStyle = "rgb(255,127,10)";
    tctx.beginPath();

    tctx.moveTo(10, 0);
    tctx.lineTo(20, 20);
    tctx.lineTo(0, 20);
    tctx.closePath();
    tctx.fill();

    canvas = document.getElementById('app');

    canvas.width = 500;
    canvas.height = 500;

    context = canvas.getContext('2d');

    if (localStorage.getItem("pseudo") !== null && localStorage.getItem("pseudo") !== "") {
        document.getElementById('daniel').value = localStorage.getItem("pseudo");
    }
    controller = new window.Controller({
        callbacks: {
            update: function (snakes, bonus) {
                last_snakes = snakes;
                last_bonus = bonus;
                if ((isLocked() || window.mobile) && (snakes[my_id] !== undefined)) {
                    followSnake(my_id);
                } else {
                    update_canvas(snakes, bonus);
                }
            },
            killed_snake: function (id) {
                socket.emit("confirm_death", {"id": my_id}, function (res) {
                    if (res === false && id === my_id) {
                        spawned = false;
                        document.getElementById("spawndiv").className = 'show';
                    } else {
                        controller.load(res, last_bonus);
                    }
                });
            }
        },
        points_bonnus: 10,
        update_rate: 10
    });
    document.getElementById("spawndiv").className = 'show';

    socket.on("+", function (data) {
        controller.addSnake.apply(controller, data);
    });

    socket.on("+b", function (data) {
        controller.addBonus.apply(controller, data);
    });

    socket.on("-b", function (data) {
        controller.eatBonus.apply(controller, data);
    });

    socket.on("-", function (data) {
        controller.killSnake.apply(controller, data);
    });

    socket.on("up", function (data) {
        controller.load(data.game.snakes, data.game.bonus);
    });

    socket.on("c", function (data) {
        controller.changeDirection.apply(controller, data);
    });

    document.getElementById('daniel').onkeyup = function (e) {
        if (e.keyCode === 13) {
            spawn_snake();
        }
    };
    secret = localStorage.getItem("secret") || window.uuid.v4();
    localStorage.setItem("secret", secret);
};



window.onscroll = function () {
    'use strict';
    window.scrollTo(0, 0);
};
