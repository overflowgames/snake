/* ******************** Zoom ******************** */



/* ******************** Gestion tactile ******************** */

var swipeFunc = { // https://gist.githubusercontent.com/localpcguy/1373518/raw/24b15a23cc323f4f453888283452908c1a870036/swipeFunc.js
    touches : {
        "touchstart": {"x":-1, "y":-1}, 
        "touchmove" : {"x":-1, "y":-1}, 
        "touchend"  : false,
        "direction" : "undetermined"
    },
    touchHandler: function(event) {
        var touch;
        if (typeof event !== 'undefined'){    
            event.preventDefault(); 
            if (typeof event.touches !== 'undefined') {
                touch = event.touches[0];
                switch (event.type) {
                    case 'touchstart':
                    case 'touchmove':
                        swipeFunc.touches[event.type].x = touch.pageX;
                        swipeFunc.touches[event.type].y = touch.pageY;
                        break;
                    case 'touchend':
                        swipeFunc.touches[event.type] = true;
                        
                        // Détection de la direction
                        
                        var diffH = swipeFunc.touches.touchstart.x - swipeFunc.touches.touchmove.x;
                        var diffV = swipeFunc.touches.touchstart.y - swipeFunc.touches.touchmove.y;
                        
                        if (swipeFunc.touches.touchstart.x > -1 && swipeFunc.touches.touchmove.x > -1) {
                            if( Math.abs(diffH) > Math.abs(diffV) )
                                swipeFunc.touches.direction = diffH > 0 ? "l" : "r";
                            else
                                swipeFunc.touches.direction = diffV > 0 ? "u" : "d";
                            
                            // DO STUFF HERE
                            //console.log(swipeFunc.touches.direction);
                            socket.emit("c", {"id":my_id, "secret":secret, "direction": swipeFunc.touches.direction}, function(data){ma_direction=data[1]});
                        }
                    default:
                        break;
                }
            }
        }
    },
    init: function() {
        document.getElementById('app').addEventListener('touchstart', swipeFunc.touchHandler, false);    
        document.getElementById('app').addEventListener('touchmove', swipeFunc.touchHandler, false);    
        document.getElementById('app').addEventListener('touchend', swipeFunc.touchHandler, false);
    }
};
swipeFunc.init();