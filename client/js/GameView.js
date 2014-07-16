/*jslint browser: true*/

function GameView(options) {
    'use strict';
    var context,
        canvas,
        grid,
        grid_context,
        back,
        back_context,
        triangle_canvas,
        position_x = options.position_x || 0,
        position_y = options.position_y || 0,
        offset_x = options.offset_x || 0,
        offset_y = options.offset_y || 0,
        sq_w = options.sq_w || 10,
        zoom = options.zoom || 1,
        pattern = options.pattern,
        tctx;


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

    grid = document.getElementById('grid');

    grid.width = 500;
    grid.height = 500;

    back = document.getElementById('background');

    back.width = 500;
    back.height = 500;

    context = canvas.getContext('2d');
    grid_context = grid.getContext('2d');
    back_context = back.getContext('2d');

    function sign(a) {
        return (a === 0) ? 0 : a / Math.abs(a);
    }

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
        return -sign(Math.asin(dists[1] / Math.hypot.apply(Math, dists))) * Math.acos(dists[0] / Math.hypot.apply(Math, dists));
    }

    function draw_grid() {
        var x,
            y;

        grid_context.strokeStyle = "#ffffff";

        if (window.mobile) {
            grid_context.lineWidth = 1;
        } else {
            grid_context.lineWidth = 0.5;
        }

        for (x = (-position_x + offset_x) % sq_w; x <= grid.width; x += sq_w) {
            grid_context.moveTo(x, 0);
            grid_context.lineTo(x, grid.height);
        }

        for (y = (-position_y + offset_y) % sq_w; y <= grid.height; y += sq_w) {
            grid_context.moveTo(0, y);
            grid_context.lineTo(grid.width, y);
        }
        grid_context.stroke();
    }

    function centerOnSnake(snake) {
        position_x = Math.round(snake.coords[0][0] - canvas.width / (2 * sq_w)) * sq_w;
        position_y = Math.round(snake.coords[0][1] - canvas.height / (2 * sq_w)) * sq_w;
    }

    function draw_back() {
        var pattern_local = context.createPattern(pattern, "repeat"),
            offx = offset_x - position_x,
            offy = offset_y - position_y;

        back_context.clearRect(0, 0, back.width, back.height);
        back_context.beginPath();

        back_context.fillStyle = pattern_local;

        back_context.translate(offx, offy);
        back_context.fillRect(-offx, -offy, back.width, back.height);
        back_context.translate(-offx, -offy);
    }

    function update_dimensions() {
        var w = window,
            win_x = w.innerWidth * zoom,
            win_y = w.innerHeight * zoom;

        if ((win_x !== canvas.width) || (win_y !== canvas.height)) {
            grid.width = win_x;
            grid.height = win_y;
            draw_grid();

            canvas.height = win_y;
            canvas.width = win_x;

            back.height = win_y;
            back.width = win_x;
            draw_back();
        }
    }

    function draw_hud(snakes, id) {
        context.font = "18px Helvetica";
        context.fillStyle = "#ffffff";

        if (snakes[id] !== undefined) {
            context.fillText("Score: " + snakes[id].score, 30, 50);
        }
        context.fillText("Connectés: " + Object.keys(snakes).length, 30, 30);
    }

    function draw_snake_part(coords, speedup, dists, lvl) {
        function add(a, b) { return Math.abs(a + b); }
        var dist = dists.reduce(add),
            snake_palette = ["#00ffff", "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#8000ff"],
            breakpoint;

        if (dist !== 0) {
            context.beginPath();
            context.moveTo(coords[0][0], coords[0][1]);
            context.lineWidth = sq_w;
            context.lineCap = 'round';
            context.strokeStyle = snake_palette[lvl];

            if (((speedup / dist) <= 1) && ((speedup / dist) > 0)) {
                breakpoint = [coords[0][0] - (sign(dists[0]) * speedup * sq_w), coords[0][1] - (sign(dists[1]) * speedup * sq_w)];
                context.lineTo.apply(context, breakpoint);
                context.stroke();
                context.beginPath();
                context.moveTo.apply(context, breakpoint);
                lvl -= 1;
                context.strokeStyle = snake_palette[lvl];
            }

            context.lineTo(coords[1][0], coords[1][1]);
            context.stroke();
            speedup = Math.max(speedup - dist, 0);
        }
        return [lvl, speedup];
    }

    function draw_snakes(snakes) {
        var i,
            ii,
            snake_speedup,
            snake_size,
            dists,
            res,
            lvl;

        // #Draw the snakes
        for (i in snakes) {
            if (snakes.hasOwnProperty(i)) {
                snake_size = snakes[i].size;
                snake_speedup = snakes[i].speedup;

                lvl = Math.ceil(snake_speedup / snake_size);
                snake_speedup = Math.max(snake_speedup - (lvl - 1) * snake_size, 0);

                for (ii = snakes[i].coords.length - 1; ii > 0; ii -= 1) {
                    dists = [snakes[i].coords[ii][0] - snakes[i].coords[ii - 1][0], snakes[i].coords[ii][1] - snakes[i].coords[ii - 1][1]];

                    res = draw_snake_part([[(snakes[i].coords[ii][0] + 0.5) * sq_w - position_x + offset_x,
                                    (snakes[i].coords[ii][1] + 0.5) * sq_w - position_y + offset_y],
                                    [(snakes[i].coords[ii - 1][0] + 0.5) * sq_w - position_x + offset_x,
                                    (snakes[i].coords[ii - 1][1] + 0.5) * sq_w - position_y + offset_y]],
                                    snake_speedup,
                                    dists,
                                    lvl);
                    lvl = res[0];
                    snake_speedup = res[1];
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
        update_dimensions();

        context.clearRect(0, 0, canvas.width, canvas.height);

        draw_snakes(snakes);
        draw_bonuses(bonus);

        // #Draw the grid

        draw_names(snakes);

        // #Draw the HUD
        draw_hud(snakes, id);
    };

    this.followSnake = function (snake) {
        var cx = snake.coords[0][0],
            cy = snake.coords[0][1],
            px = cx * sq_w,
            py = cy * sq_w,
            paddingx = canvas.width / 5 - 20,
            paddingy = canvas.height / 5 - 20;

        if (px < position_x || px > position_x + canvas.width || py < position_y || py > position_y + canvas.height) {
            centerOnSnake(snake);
            draw_back();
            return;
        }

        if (px < position_x + paddingx) {
            position_x -= sq_w;
            draw_back();
        } else if (px > position_x + canvas.width - paddingx) {
            position_x += sq_w;
            draw_back();
        }

        if (py < position_y + paddingy) {
            position_y -= sq_w;
            draw_back();
        } else if (py > position_y + canvas.height - paddingy) {
            position_y += sq_w;
            draw_back();
        }
    };

    this.getCenter = function () {
        return [[Math.round((position_x + canvas.width / 2) / sq_w), Math.round((position_y + canvas.height / 2) / sq_w)]];
    };

    this.setZoom = function (z) {
        zoom = z || 1;
    };

    this.getZoom = function () {
        return zoom;
    };
}
