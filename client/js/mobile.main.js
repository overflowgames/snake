/* ******************** Gestion zoom ******************** */

if( localStorage.getItem("mobile-zoom") !== null )
    window.zoom = parseFloat(localStorage.getItem("mobile-zoom"));

var args = window.location.hash.split("#");
for( var i=1 ; i < args.length ; i++) {
    if( args[i].split("=")[0] == "zoom" )
        window.zoom = parseFloat(args[i].split("=")[1]);
}    

function zoomC(change) {
    window.zoom += change;
    
    if( window.zoom > 1.5 )
        window.zoom = 1.5;
    else if( window.zoom < 0.5 )
        window.zoom = 0.5;
        
    localStorage.setItem("mobile-zoom", window.zoom);
}