var socket = io.connect();
var controller;

var zoom = 1;

// set up a pattern, something really elaborate!
var pattern = document.createElement('canvas');
pattern.width = 512;
pattern.height = 512;
var pctx = pattern.getContext('2d');

var gradient = pctx.createLinearGradient(0,0,pattern.width, pattern.height);
gradient.addColorStop(0,"#3B5998");    
gradient.addColorStop(1/4,"#4B7BC9"); 
gradient.addColorStop(2/4,"#3B5998");
gradient.addColorStop(3/4,"#4B7BC9"); 
gradient.addColorStop(1,"#3B5998");  
pctx.fillStyle = gradient; 
pctx.fillRect(0, 0, pattern.width, pattern.height);


var triangle_canvas = document.createElement('canvas');
triangle_canvas.width = 20;
triangle_canvas.height = 20;
var tctx = triangle_canvas.getContext('2d');
tctx.fillStyle="rgba(255,127,10,0.95)";
tctx.beginPath();

tctx.moveTo(10,0);
tctx.lineTo(20,20);
tctx.lineTo(0,20);
tctx.closePath();
tctx.fill();

var canvas = document.getElementById('app');
if(!canvas) {
    alert("Impossible de récupérer le canvas");
}

canvas.width = 500;
canvas.height = 500;

var context = canvas.getContext('2d');
if(!context) {
    alert("Impossible de récupérer le context du canvas");
}
 
 
var position_x=-145;
var position_y=-145; 

var offset_x=0;
var offset_y=0; 

var height = 500;
var width = 500;

var sq_w=10;
var anim;

var my_id="";

var last_snakes, last_bonus;

var spawned = false;

var padding = 150;

var my_score = 0;
var nconnectes = 0;


function draw_grid() {

    for(var x=(-position_x+offset_x)%sq_w; x<=width;x+=sq_w) {
        
        context.moveTo(x, 0);
        context.lineTo(x, height);
        
    }
    
    for(var y=(-position_y+offset_y)%sq_w; y<=height;y+=sq_w) {
        
        context.moveTo(0, y);
        context.lineTo(width, y);
    }
    context.stroke();
}

function update_dimensions(){
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    win_x = w.innerWidth || e.clientWidth || g.clientWidth,
    win_y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    win_x *= zoom;
    win_y *= zoom;

    if(height == win_y && width  == win_x)
	return;    
    height = win_y;
    width = win_x;
    
    canvas.height = win_y;
    canvas.width = win_x;
}

function draw_hud() {
    context.font = "18px Helvetica";//On passe à l'attribut "font" de l'objet context une simple chaîne de caractères composé de la taille de la police, puis de son nom.
    context.fillStyle = "#ffffff";
    
    var cx = Math.round((position_x-offset_x+canvas.width/2)/sq_w);
    var cy = Math.round((position_y-offset_y+canvas.height/2)/sq_w);
    
    context.fillText("x: "+cx, 30, 30);
    context.fillText("y: "+cy, 30, 50);
    context.fillText("score: "+my_score, 30, 70);
    context.fillText("connectés: "+nconnectes, 30, 90);
}

setInterval(function() {
    if(isLocked() || mobile) 
        followSnake(my_id);
},1000/500);

    
var pattern_ = context.createPattern(pattern, "repeat");
    
function update_canvas(snakes, bonus) {
    // #Get the viewport dimensions
    update_dimensions();

    // #Reset the canvas
    var offx, offy;
    offx = offset_x-position_x;
    offy = offset_y-position_y;
    
    context.beginPath();
    
    context.fillStyle = pattern_;

    context.translate(offx, offy);
    context.fillRect(-offx, -offy, canvas.width, canvas.height);
    context.translate(-offx, -offy);
    
    
    draw_snakes (snakes);
    draw_bonuses (bonus);
    
    // #Draw the grid
    context.strokeStyle = "#ffffff";
    if(mobile)
        context.lineWidth=1;
    else 
        context.lineWidth=0.5;
    draw_grid();
    
    draw_names(snakes);
    
    if(typeof snakes[my_id] != 'undefined') {
        my_score = snakes[my_id].score;
    }
    
    // #Draw the HUD
    draw_hud();
}

function draw_snakes (snakes) {
    // #Draw the snakes
    nconnectes = 0;
    for(var i in snakes) {
        nconnectes++;
        for(var ii = 0; ii < snakes[i].coords.length;ii++) {
            var cx = snakes[i].coords[ii][0];
            var cy = snakes[i].coords[ii][1];
            
           context.fillStyle = "#00ffff";
           context.fillRect(cx*sq_w-position_x+offset_x, cy*sq_w-position_y+offset_y, sq_w, sq_w);
           
        }
    }
    
}

function draw_bonuses (bonus) {
    // #Draw bonuses
    for(var i in bonus) {
        if(bonus[i] != null) {
            var cx = bonus[i][0];
            var cy = bonus[i][1];
            
            context.fillStyle = "#ffaa00";
            context.fillRect(cx*sq_w-position_x+offset_x, cy*sq_w-position_y+offset_y, sq_w, sq_w);
        }
    }
}

function draw_names (snakes) {
    // #Draw names
    for(var i in snakes) {
        if(visible(snakes[i])) {
            var sx, sy;
            var tx, ty;
            sx = snakes[i].coords[0][0];
            sy = snakes[i].coords[0][1];
            
            context.fillStyle = "rgba(66, 66, 66, 0.5)";
            context.font = "16px Helvetica";
            
            var tw = context.measureText(snakes[i].name).width;
            
            tx = sx*sq_w-position_x+offset_x - tw/2;
            ty = sy*sq_w-position_y+offset_y - sq_w*1.5;
            
            
            context.fillRect(tx-2, ty-16, tw + 4, 20);
        
            context.fillStyle = "#ffffff";
            context.fillText(snakes[i].name, tx, ty);
        } else {
            dists = getDistanceFromCenter(snakes[i]);
            var dx = dists[0];
            var dy = dists[1];
            
            
            var drawx, drawy;
            
            if((Math.abs(dx)<600) && (Math.abs(dy) < 600)) {
                var flagx,flagy;
                var ofsx, ofsy;
                
                context.font = "18px Helvetica";
                context.fillStyle = "#ffffff";
                
                var dist = Math.round(Math.sqrt(dx*dx + dy*dy));
                var tw = context.measureText(dist).width;
                
                if(dx < -canvas.width/(2*sq_w)) {
                    drawx = 10; 
                    flagx=-1;
                } else if(dx > canvas.width/(2*sq_w)) {
                    drawx = canvas.width - 20;
                    flagx=1;
                } else {
                    drawx = canvas.width/2 + dx *sq_w;
                    flagx=0;
                }
                    
                if(dy < -canvas.height/(2*sq_w)) {
                    drawy = 10; 
                    flagy=-1;
                } else if(dy > canvas.height/(2*sq_w)) {
                    drawy = canvas.height - 30;
                    flagy=1;
                } else {
                    drawy = canvas.height/2 + dy *sq_w;
                    flagy=0;
                }
                
                context.save(); 
                context.translate(drawx, drawy);
                
                switch(flagx) {
                    case -1: 
                        switch(flagy) { 
                            case -1: // haut gauche
                                context.rotate(-Math.PI/4);
                                
                                ofsx = 25;
                                ofsy = 40;
                                break;
                            case 0: // gauche
                                context.rotate(-Math.PI/2);
                                
                                ofsx = 25;
                                ofsy = -5;
                                break;
                            case 1: // bas gauche
                                context.rotate(-3*Math.PI/4);
                                
                                ofsx = 25;
                                ofsy = -25;
                                break;
                        }
                        break;
                    case 0:
                        switch(flagy) {
                            case -1: // haut
                                ofsx = 10-tw/2;
                                ofsy = 40;
                                break;
                            case 1: // bas
                                context.rotate(Math.PI);
                                
                                ofsx = -10-tw/2;
                                ofsy = -25;
                                break;
                        }
                        break;
                    case 1: 
                        switch(flagy) {
                            case -1: // haut droite
                                context.rotate(Math.PI/4);
                                
                                ofsx = -30-tw;
                                ofsy = 40;
                                break;
                            case 0: // droite  
                                context.rotate(Math.PI/2);
                                
                                ofsx = -30-tw;
                                ofsy = 15;
                                break;
                            case 1: // basdroite
                                context.rotate(3*Math.PI/4);
                                
                                ofsx = -30-tw;
                                ofsy = -25;
                                break;
                        }
                        break;
                }
                
                
                context.drawImage(triangle_canvas, 0, 0);
                context.restore(); 
                
                
                context.fillText(dist, drawx + ofsx, drawy + ofsy);
            }
        }
    }
}

function getDistanceFromCenter(snake) {
    var sx = snake.coords[0][0];
    var sy = snake.coords[0][1];
    
    var cx = Math.round((position_x-offset_x+canvas.width/2)/sq_w);
    var cy = Math.round((position_y-offset_y+canvas.height/2)/sq_w);
    
    var distx = sx - cx;
    var disty = sy - cy;
        
    return [distx, disty];
}


function visible(snake) {
    var sx = snake.coords[0][0];
    var sy = snake.coords[0][1];
    
    
    var cx = Math.round((position_x-offset_x+canvas.width/2)/sq_w);
    var cy = Math.round((position_y-offset_y+canvas.height/2)/sq_w);
    
    var distx = Math.abs(cx - sx);
    var disty = Math.abs(cy - sy);
    
    distx -= canvas.width/(2*sq_w);
    disty -= canvas.height/(2*sq_w);
    
    if(distx < 0 && disty < 0)
        return 1;
    else
        return 0;
    
}

var secret = localStorage.getItem("secret") || uuid.v4();
localStorage.setItem("secret", secret);
socket.emit("login", {secret : secret}, function(data){
    my_id=data;
    controller = new Controller({
        callbacks: {
            update: function (snakes, bonus) {
                last_snakes=snakes;
                last_bonus=bonus;
                update_canvas(snakes, bonus);
            },
            eaten_bonnus: function (id) { },
            add_points: function (id, score) { },
            add_bonus: function (id, coords) { },
            add_snake: function (id, coords, direction, score, size, name) { },
            killed_snake: function (id) {
                if(id === my_id){
                    spawned = false;
                    document.getElementById("spawndiv").className = 'show';
                }
                
            },
            change_direction: function (id, direction) { }
        },
        points_bonnus: 10,
        disable_update: true,
        update_rate: 10
    });
    document.getElementById("spawndiv").className = 'show';
});

socket.on("+", function(data){
    if (data[0] != my_id){
        controller.addSnake(data[0],data[1], data[2],data[3],data[4],data[5], data[6]);
    }
});

socket.on("+b", function(data){
        controller.addBonus(data[0],data[1]);
})

socket.on("-b", function(data){
        controller.eatBonus(data[0],data[1]);
})

socket.on("-", function(data){
        controller.killSnake(data[0], data[1]);
});

socket.on("up", function(data){
    controller.load(data.game.snakes, data.game.bonus);
});

socket.on("c", function(data){
    controller.changeDirection(data[0],data[1], data[2]);
});

socket.on("u", function(data){
    if(controller != undefined)
        controller.update();
});


document.getElementById('daniel').onkeyup = function (e) {
    if (e.keyCode === 13) {
       spawn_snake();
    }
};
  
  
function spawn_snake() {
    var pseudo = document.getElementById('daniel').value;
        
    localStorage.setItem("pseudo", pseudo);
    
    if(spawned) {
        return;
    }
    
    spawned = true;
    var c = [[Math.round( (position_x+canvas.width/2)/sq_w), Math.round((position_y+canvas.height/2)/sq_w)]]
    
	if(pseudo == "") {
		pseudo = "Jack Banane";
	}

	socket.emit("spawn", {"id":my_id, "secret":secret, "name": pseudo, "pos":c}, function(pos){
       
        if (pos === "ko"){
            spawned = false;
            console.log("Y'a une couille avec le secret !!!");
            return;
        }
        console.log(pos)
        controller.addSnake(my_id,pos, "u",0,20,pseudo);
        //centerOnSnake(my_id);
        
        document.getElementById("spawndiv").className = 'hide';
    });
}



function centerOnSnake(id) {
    var cx = last_snakes[id].coords[0][0];
    var cy = last_snakes[id].coords[0][1];
    
    var px = cx * sq_w;
    var py = cy * sq_w;
    
    // px = (position_x + position_x + width) / 2
    // px = position_x + width/2
    // position_x = px - width/2
    
    position_x = px - width/2;
    position_y = py - height/2;
    update_canvas(last_snakes, last_bonus);
}

function followSnake(id) {
    if(last_snakes == undefined)
        return;
    if(last_snakes[id] == undefined)
        return;
    
    
    var cx = last_snakes[id].coords[0][0];
    var cy = last_snakes[id].coords[0][1];
    
    var px = cx * sq_w;
    var py = cy * sq_w;
    
    var paddingx = width /5 - 20;
        
    var paddingy = height/5 - 20;
    
    anim=false;
    
    if(px < position_x) {
        centerOnSnake(id);
        return;
    } else if(px < position_x + paddingx) {
        position_x = position_x - 3;
        if(px < position_x + paddingx)
            anim = true;
    } else if(px > position_x + width) {
        centerOnSnake(id);
        return;
    } else if(px > position_x + width - paddingx) {
        position_x = position_x + 3;
        if(px > position_x + width - paddingx)
            anim = true;
    }
    
    if(py < position_y) {
        centerOnSnake(id);
        return;
    } else if(py < position_y + paddingy) {
        position_y = position_y - 3;
        if(py < position_y + paddingy)
            anim = true;
    } else if(py > position_y + height) {
        centerOnSnake(id);
        return;
    } else if(py > position_y + height - paddingy) {
        position_y = position_y + 3;
        if(py > position_y + height - paddingy)
            anim = true;
    }
    update_canvas(last_snakes, last_bonus);
}

document.onkeydown = function(event) {
    event = event || window.event; 
    switch (event.keyCode) {
        case 37:// left
            socket.emit("c", {"id":my_id, "secret":secret, "direction": "l"}, function(data){});
            break;
        case 38://up
            socket.emit("c", {"id":my_id, "secret":secret, "direction": "u"}, function(data){});
            break;
        case 39://right
            socket.emit("c", {"id":my_id, "secret":secret, "direction": "r"}, function(data){});
            break;
        case 40://down
            socket.emit("c", {"id":my_id, "secret":secret, "direction": "d"}, function(data){});
            break;
    }
    
    
};

if  (document.getElementById){
(function(){

    //Stop Opera selecting anything whilst dragging.
    if (window.opera){
        document.write("<input type='hidden' id='Q' value=' '>");
    }
    
    var n = 500;
    var dragok = false;
    var y,x,d,dy,dx;
    
    function move(e){
        if (!e) e = window.event;
        if (dragok){
          var lft=dx + e.clientX - x,top=dy + e.clientY - y;
          offset_x=lft;
          offset_y=top;
          update_canvas(last_snakes, last_bonus);
          return false;
        }
    }
    
    function down(e){
    if (!e) e = window.event;
    var temp = (typeof e.target != "undefined")?e.target:e.srcElement;
    if (temp.tagName != "HTML"|"BODY" && temp.className != "dragclass"){
     temp = (typeof temp.parentNode != "undefined")?temp.parentNode:temp.parentElement;
     }
    if (temp.className == "dragclass"){
     if (window.opera){
      document.getElementById("Q").focus();
     }
     dragok = true;
     temp.style.zIndex = n++;
     d = temp;
     dx = parseInt(temp.style.left+0);
     dy = parseInt(temp.style.top+0);
     x = e.clientX;
     y = e.clientY;
     document.onmousemove = move;
     return false;
     }
    }
    
    function up(){
        dragok = false;
        document.onmousemove = null;
        
        position_x-=offset_x;
        position_y-=offset_y;
        
        offset_x=0;
        offset_y=0;
    }
    
    document.onmousedown = down;
    document.onmouseup = up;
    
    })();
}//End.
if (localStorage.getItem("pseudo") !== null && localStorage.getItem("pseudo") !== "") {
    document.getElementById('daniel').value = localStorage.getItem("pseudo");
}

var locked = true;

function lock() {
    locked = true;
    document.getElementById('button_locked').style.display = "block";
    document.getElementById('button_lock').style.display = "nonez";
    window.update_canvas();
}

function unlock() {
    locked = false;
    document.getElementById('button_locked').style.display = "none";
    document.getElementById('button_lock').style.display = "block";
    window.update_canvas();
}

window.onscroll = function() {
    window.scrollTo(0, 0);
};

function isLocked() {
    return locked;
}