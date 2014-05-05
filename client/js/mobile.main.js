/* ******************** Gestion zoom ******************** */

if( localStorage.getItem("mobile-zoom") !== null )
    zoom = parseFloat(localStorage.getItem("mobile-zoom"));

var args = window.location.hash.split("#");
for( var i=1 ; i < args.length ; i++) {
    if( args[i].split("=")[0] == "zoom" )
        zoom = parseFloat(args[i].split("=")[1]);
}    

function zoomC(change) {
    zoom += change;
    
    if( zoom > 1.5 )
        zoom = 1.5;
    else if( zoom < 0.5 )
        zoom = 0.5;
        
    localStorage.setItem("mobile-zoom", zoom);
}