/*jslint browser: true */
/* ******************** Gestion zoom ******************** */

var args = window.location.hash.split("#"),
    i;
if (localStorage.getItem("mobile-zoom") !== null) {
    window.zoom = parseFloat(localStorage.getItem("mobile-zoom"));
}

for (i = 1; i < args.length; i += 1) {
    if (args[i].split("=")[0] === "zoom") {
        window.zoom = parseFloat(args[i].split("=")[1]);
    }
}

function zoomC(change) {
    'use strict';
    window.zoom += change;

    if (window.zoom > 1.5) {
        window.zoom = 1.5;
    } else if (window.zoom < 0.5) {
        window.zoom = 0.5;
    }

    localStorage.setItem("mobile-zoom", window.zoom);
}