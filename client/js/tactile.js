/* ******************** Gestion tactile ********************
 *  https://gist.githubusercontent.com/localpcguy/1373518/raw/24b15a23cc323f4f453888283452908c1a870036/swipeFunc.js
 * ********************************************************* */
var swipeFunc = {
    seuil : 10,
    touches : {
        "touchstart": {"x":-1, "y":-1}, 
        "touchmove" : {"x":-1, "y":-1}, 
        "touchend"  : false,
        "direction" : "u",
        "last" : ""
    },
    touchHandler: function(event) {
        var touch;
        if (typeof event !== 'undefined'){    
            event.preventDefault(); 
            if (typeof event.touches !== 'undefined') {
                touch = event.touches[0];
                
                swipeFunc.touches[event.type].x = touch.pageX;
                swipeFunc.touches[event.type].y = touch.pageY;
                
                switch (event.type) {
                    case 'touchmove':
                        
                        var diffH = swipeFunc.touches.touchstart.x - swipeFunc.touches.touchmove.x;
                        var diffV = swipeFunc.touches.touchstart.y - swipeFunc.touches.touchmove.y;
                        
                        if (swipeFunc.touches.touchstart.x > -1 && swipeFunc.touches.touchmove.x > -1) {
                            if( Math.abs(diffH) > Math.abs(diffV) )
                                swipeFunc.touches.direction = diffH > 0 ? "l" : "r";
                            else
                                swipeFunc.touches.direction = diffV > 0 ? "u" : "d";
                        }
                        
                        if( (Math.max(Math.abs(diffH), Math.abs(diffV)) > swipeFunc.seuil) && (swipeFunc.touches.last != swipeFunc.touches.direction)) {
                            swipeFunc.touches.touchstart.x = swipeFunc.touches.touchmove.x;
                            swipeFunc.touches.touchstart.y = swipeFunc.touches.touchmove.y;
                            swipeFunc.touches.last = swipeFunc.touches.direction;
                            
                            window.socket.emit("c", {"id":window.my_id, "secret":window.secret, "direction": swipeFunc.touches.direction}, function(data){});
                        }
                        break;
                    case 'touchend':
                        swipeFunc.touches.last = "";
                        break;
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