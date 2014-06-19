/*jslint browser: true*/
/*global GameView: false*/

var controller,
    secret,
    my_id = "",
    spawned = false,
    socket,
    locked = true,
    view = new GameView({});

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

    socket = window.io.connect("@@URL_SOCKETIO_SERVER");

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
