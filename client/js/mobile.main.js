/*jslint browser: true */
/*global view: false */
/* ******************** Gestion zoom ******************** */

document.addEventListener("DOMContentLoaded", function () {
    'use strict';
    var args = window.location.hash.split("#"),
        i;

    if (localStorage.getItem("mobile-zoom") !== null) {
        view.setZoom(parseFloat(localStorage.getItem("mobile-zoom")));
    }

    for (i = 1; i < args.length; i += 1) {
        if (args[i].split("=")[0] === "zoom") {
            view.setZoom(parseFloat(args[i].split("=")[1]));
        }
    }
}, false);

function zoomC(change) {
    'use strict';
    console.log(Math.min(Math.max(view.getZoom() + change, 0.5), 1.5))
    view.setZoom(Math.min(Math.max(view.getZoom() + change, 0.5), 1.5));
    localStorage.setItem("mobile-zoom", window.zoom);
}