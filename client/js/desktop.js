/*jslint browser: true */

var i,
    locked,
    elems = document.getElementsByClassName("lock");

function toogle_lock() {
    'use strict';
    locked = !locked;
    document.getElementById('button_locked').style.display = locked ? "block" : "none";
    document.getElementById('button_lock').style.display = locked ? "none" : "block";
}

for (i = 0;  i < elems.length; i += 1) {
    elems[i].onclick = toogle_lock;
}

document.onkeydown = function (event) {
    'use strict';
    event = event || window.event;
    switch (event.keyCode) {
    case 37:// left
        window.socket.emit("c", {"id": window.my_id, "secret": window.secret, "direction": "l"});
        break;
    case 38://up
        window.socket.emit("c", {"id": window.my_id, "secret": window.secret, "direction": "u"});
        break;
    case 39://right
        window.socket.emit("c", {"id": window.my_id, "secret": window.secret, "direction": "r"});
        break;
    case 40://down
        window.socket.emit("c", {"id": window.my_id, "secret": window.secret, "direction": "d"});
        break;
    }

};

/*if (document.getElementById) {
    (function () {
        'use strict';
        var dragok = false,
            y,
            x,
            dy,
            dx;

        if (window.opera) {
            document.getElementsByTagName("span").innerHTML += "<input type='hidden' id='Q' value=' '>";
        }

        function move(e) {
            e = e || window.event;
            if (dragok) {
                var lft = dx + e.clientX - x,
                    top = dy + e.clientY - y;
                window.offset_x = lft;
                window.offset_y = top;
                window.update_canvas(window.last_snakes, window.last_bonus);
                return false;
            }
        }

        function down(e) {
            var temp = (e.target !== undefined) ? e.target : e.srcElement;

            e = e || window.event;

            if (temp.tagName !== "HTML" && temp.tagName !== "BODY" && temp.className !== "dragclass") {
                temp = (temp.parentNode !== undefined) ? temp.parentNode : temp.parentElement;
            }
            if (temp.className === "dragclass") {
                if (window.opera) {
                    document.getElementById("Q").focus();
                }
                dragok = true;
                dx = parseInt(temp.style.left, 10);
                dy = parseInt(temp.style.top, 10);
                x = e.clientX;
                y = e.clientY;
                document.onmousemove = move;
                return false;
            }
        }

        function up() {
            dragok = false;
            document.onmousemove = null;

            window.position_x -= window.offset_x;
            window.position_y -= window.offset_y;

            window.offset_x = 0;
            window.offset_y = 0;
        }

        document.onmousedown = down;
        document.onmouseup = up;

    }());
}*///End.