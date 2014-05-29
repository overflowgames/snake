
document.onkeydown = function(event) {
    event = event || window.event;
    switch (event.keyCode) {
        case 37:// left
            window.socket.emit("c", {"id":window.my_id, "secret":window.secret, "direction": "l"}, function(data){});
            break;
        case 38://up
            window.socket.emit("c", {"id":window.my_id, "secret":window.secret, "direction": "u"}, function(data){});
            break;
        case 39://right
            window.socket.emit("c", {"id":window.my_id, "secret":window.secret, "direction": "r"}, function(data){});
            break;
        case 40://down
            window.socket.emit("c", {"id":window.my_id, "secret":window.secret, "direction": "d"}, function(data){});
            break;
    }
    
};

if (document.getElementById) {
    (function() {

        if (window.opera) {
            document.getElementsByTagName("span").innerHTML += "<input type='hidden' id='Q' value=' '>";
        }

        var n = 500;
        var dragok = false;
        var y, x, d, dy, dx;

        function move(e) {
            if (!e) e = window.event;
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
            if (!e) e = window.event;
            var temp = (typeof e.target != "undefined") ? e.target : e.srcElement;
            if (temp.tagName != "HTML" | "BODY" && temp.className != "dragclass") {
                temp = (typeof temp.parentNode != "undefined") ? temp.parentNode : temp.parentElement;
            }
            if (temp.className == "dragclass") {
                if (window.opera) {
                    document.getElementById("Q").focus();
                }
                dragok = true;
                temp.style.zIndex = n++;
                d = temp;
                dx = parseInt(temp.style.left + 0, 10);
                dy = parseInt(temp.style.top + 0, 10);
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

    })();
} //End.