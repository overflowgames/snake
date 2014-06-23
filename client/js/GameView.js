/*jslint browser: true*/

function GameView(options) {
    'use strict';
    var pattern,
        context,
        canvas,
        triangle_canvas,
        pctx,
        gradient,
        position_x = options.position_x || -145,
        position_y = options.position_y || -145,
        offset_x = options.offset_x || 0,
        offset_y = options.offset_y || 0,
        height = options.height || 500,
        width = options.width || 500,
        sq_w = options.sq_w || 10,
        zoom = options.zomm || 1,
        tctx;


    pattern = document.createElement('canvas');
    pattern.width = 512;
    pattern.height = 512;


    pctx = pattern.getContext('2d');
    gradient = pctx.createLinearGradient(0, 0, pattern.width, pattern.height);
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

    function getDistanceFromCenter(snake) {
        var sx = snake.coords[0][0],
            sy = snake.coords[0][1],
            cx = Math.round((position_x - offset_x + canvas.width / 2) / sq_w),
            cy = Math.round((position_y - offset_y + canvas.height / 2) / sq_w);

        return [sx - cx, sy - cy];
    }

    function visible(snake) {
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

    function getAngleFromCenter(snake) {
        var dists = getDistanceFromCenter(snake);
        return -Math.sign(Math.asin(dists[1] / Math.hypot.apply(Math, dists))) * Math.acos(dists[0] / Math.hypot.apply(Math, dists));
    }

    function centerOnSnake(snake) {
        var cx = snake.coords[0][0],
            cy = snake.coords[0][1],
            px = cx * sq_w,
            py = cy * sq_w;

        position_x = px - width / 2;
        position_y = py - height / 2;
    }

    function draw_grid() {
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

    function draw_hud(snake) {
        context.font = "18px Helvetica";
        context.fillStyle = "#ffffff";

        if (snake !== undefined) {
            context.fillText("Score: " + snake.score, 30, 50);
        }
        context.fillText("Connectés: " + Object.keys(snake).length, 30, 30);
    }

    function draw_snakes(snakes) {
        var snake_palette = ["#00ffff", "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#8000ff"],
            i,
            ii,
            x,
            y,
            snake_speedup,
            snake_size,
            dist,
            dists,
            lvl;

        function add(a, b) { return Math.abs(a + b); }
        // #Draw the snakes
        for (i in snakes) {
            if (snakes.hasOwnProperty(i)) {
                snake_size = snakes[i].size;
                snake_speedup = snakes[i].speedup;

                lvl = Math.ceil(snake_speedup / snake_size);
                snake_speedup = Math.max(snake_speedup - (lvl - 1) * snake_size, 0);

                for (ii = snakes[i].coords.length - 1; ii > 0; ii -= 1) {
                    dists = [snakes[i].coords[ii][0] - snakes[i].coords[ii - 1][0], snakes[i].coords[ii][1] - snakes[i].coords[ii - 1][1]];
                    dist = dists.reduce(add);

                    if (dist !== 0) {
                        x = (snakes[i].coords[ii][0] + 0.5) * sq_w - position_x + offset_x;
                        y = (snakes[i].coords[ii][1] + 0.5) * sq_w - position_y + offset_y;

                        context.beginPath();
                        context.moveTo(x, y);
                        context.lineWidth = sq_w;
                        context.lineCap = 'round';
                        context.strokeStyle = snake_palette[lvl];

                        if (((snake_speedup / dist) <= 1) && ((snake_speedup / dist) > 0)) {
                            context.lineTo(x - (Math.sign(dists[0]) * snake_speedup * sq_w), y - (Math.sign(dists[1]) * snake_speedup * sq_w));
                            context.stroke();
                            context.beginPath();
                            context.moveTo(x - (Math.sign(dists[0]) * snake_speedup * sq_w), y - (Math.sign(dists[1]) * snake_speedup * sq_w));
                            lvl -= 1;
                            context.strokeStyle = snake_palette[lvl];
                        }

                        context.lineTo((snakes[i].coords[ii - 1][0] + 0.5) * sq_w - position_x + offset_x, (snakes[i].coords[ii - 1][1] + 0.5) * sq_w - position_y + offset_y);
                        context.stroke();
                        snake_speedup = Math.max(snake_speedup - dist, 0);
                    }
                }
            }
        }
    }

    function draw_bonuses(bonus) {
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

    function draw_arrow(snake) {
        var draw = [0, 0],
            dist,
            angle,
            dists;

        dists = getDistanceFromCenter(snake);
        angle = getAngleFromCenter(snake);
        context.font = "18px Helvetica";
        context.fillStyle = "#ffffff";

        dist = Math.round(Math.hypot.apply(Math, dists));

        draw = [(canvas.width / 2) * (Math.cos(angle) + 1), (canvas.height / 2) * (1 - Math.sin(angle))];

        context.save();
        context.translate.apply(context, draw);

        context.rotate(-angle + (Math.PI / 2));

        context.drawImage(triangle_canvas, 0, 0);
        context.restore();

        context.fillText(dist, draw[0] - 35 * Math.cos(angle) - context.measureText(dist).width / 2, draw[1] + 35 * Math.sin(angle));

    }

    function draw_names(snakes) {
        // #Draw names
        var tw = 0,
            i,
            sx,
            sy,
            tx,
            ty,
            dists;

        for (i in snakes) {
            if (snakes.hasOwnProperty(i)) {
                dists = getDistanceFromCenter(snakes[i]);
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
                    if ((Math.abs(dists[0]) < 600) && (Math.abs(dists[1]) < 600)) {
                        draw_arrow(snakes[i]);
                    }
                }
            }
        }
    }

    this.update_canvas = function (snakes, bonus, id) {
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

        // #Draw the HUD
        draw_hud(snakes[id]);
    };

    this.followSnake = function (snake) {
        var cx = snake.coords[0][0],
            cy = snake.coords[0][1],
            px = cx * sq_w,
            py = cy * sq_w,
            paddingx = width / 5 - 20,
            paddingy = height / 5 - 20;

        if (px < position_x) {
            centerOnSnake(snake);
            return;
        }

        if (px > position_x + width) {
            centerOnSnake(snake);
            return;
        }

        if (px < position_x + paddingx) {
            position_x = position_x - sq_w;
        } else if (px > position_x + width - paddingx) {
            position_x = position_x + sq_w;
        }

        if (py < position_y) {
            centerOnSnake(snake);
            return;
        }

        if (py > position_y + height) {
            centerOnSnake(snake);
            return;
        }

        if (py < position_y + paddingy) {
            position_y = position_y - sq_w;
        } else if (py > position_y + height - paddingy) {
            position_y = position_y + sq_w;
        }
    };

    this.getCenter = function () {
        return [[Math.round((position_x + canvas.width / 2) / sq_w), Math.round((position_y + canvas.height / 2) / sq_w)]];
    };
}
