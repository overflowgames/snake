/*jslint browser: true*/
/*global GameView: false*/

var controller,
    secret,
    my_id = "",
    spawned = false,
    socket,
    pattern,
    pctx,
    gradient,
    locked = true,
    view;


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

view = new GameView({
    pattern: pattern
});


function spawn_snake(center) {
    'use strict';
    var pseudo = document.getElementById('daniel').value;

    localStorage.setItem("pseudo", pseudo);

    if (spawned) {
        return;
    }

    spawned = true;

    if (pseudo === "") {
        pseudo = "Jack Banane";
    }

    socket.emit("spawn", {"secret": secret, "name": pseudo, "pos": center}, function (data) {
        if (data === "ko") {
            spawned = false;
        } else {
            document.getElementById("spawndiv").className = 'hide';
            my_id = data;
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    'use strict';

    socket = window.io("@@URL_SOCKETIO_SERVER");
    socket.on("connect", function () {
        document.getElementById("spawndiv").className = 'show';
        document.getElementById("load").className = 'hidden';
    });

    if (localStorage.getItem("pseudo") !== null && localStorage.getItem("pseudo") !== "") {
        document.getElementById('daniel').value = localStorage.getItem("pseudo");
    }
    controller = new window.Controller({
        callbacks: {
            update: function (snakes, bonus) {
                if (locked && (snakes[my_id] !== undefined)) {
                    view.followSnake(snakes[my_id]);
                }
                view.update_canvas(snakes, bonus, my_id);
            },
            killed_snake: function (id) {
                socket.emit("confirm_death", {"id": my_id}, function (res) {
                    if (res === false && id === my_id) {
                        spawned = false;
                        document.getElementById("spawndiv").className = 'show';
                    } else {
                        controller.load(res);
                    }
                });
            }
        },
        points_bonus: 10,
        update_rate: 10
    });

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
            spawn_snake(socket);
        }
    };
    document.getElementById("spawn").onclick = function () {
        spawn_snake(view.getCenter());
    };

    secret = localStorage.getItem("secret") || window.uuid.v4();
    localStorage.setItem("secret", secret);
}, false);



window.onscroll = function () {
    'use strict';
    window.scrollTo(0, 0);
};
