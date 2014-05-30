var controller, socket;
var zoom = 1;
var context,canvas,secret,pattern;
window.onload = function () {
    socket = window.io.connect("@@URL_SOCKETIO_SERVER");
    
    
    pattern = document.createElement('canvas');
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
    tctx.fillStyle="rgb(255,127,10)";
    tctx.beginPath();
    
    tctx.moveTo(10,0); 
    tctx.lineTo(20,20);
    tctx.lineTo(0,20);
    tctx.closePath();
    tctx.fill();
    
    canvas = document.getElementById('app');
    if(!canvas) {
        alert("Impossible de récupérer le canvas");
    }
    
    canvas.width = 500;
    canvas.height = 500;
    
    context = canvas.getContext('2d');
    if(!context) {
        alert("Impossible de récupérer le context du canvas");
    }
    
    if (localStorage.getItem("pseudo") !== null && localStorage.getItem("pseudo") !== "") {
        document.getElementById('daniel').value = localStorage.getItem("pseudo");
    }
    controller = new window.Controller({
        callbacks: {
            update: function (snakes, bonus) {
                last_snakes=snakes;
                last_bonus=bonus;
                if((isLocked() || window.mobile) && (snakes[my_id] !== undefined))
                    followSnake(my_id);
                else
                    update_canvas(snakes, bonus);
            },
            eaten_bonnus: function (id) { },
            add_points: function (id, score) { },
            add_bonus: function (id, coords) { },
            add_snake: function (id, coords, direction, score, size, name) { },
            killed_snake: function (id) {
                socket.emit("confirm_death", {"id":my_id}, function(res){
                    if(res === false && id === my_id){
                        spawned = false;
                        document.getElementById("spawndiv").className = 'show';
                    } else {
                        controller.load(res, last_bonus);
                    }
                });
            },
            change_direction: function (id, direction) { }
        },
        points_bonnus: 10,
        update_rate: 10
    });
    document.getElementById("spawndiv").className = 'show';
    
    socket.on("+", function(data){
        controller.addSnake(data[0],data[1], data[2],data[3],data[4],data[5], data[6], data[7]);
    });
    
    socket.on("+b", function(data){
        controller.addBonus(data[0],data[1],data[2]);
    });
    
    socket.on("-b", function(data){
        controller.eatBonus(data[0],data[1]);
    });
    
    socket.on("-", function(data){
        controller.killSnake(data[0], data[1]);
    });
    
    socket.on("up", function(data){
        controller.load(data.game.snakes, data.game.bonus);
    });
    
    socket.on("c", function(data){
        controller.changeDirection(data[0],data[1], data[2]);
    });
    
    document.getElementById('daniel').onkeyup = function (e) {
        if (e.keyCode === 13) {
           spawn_snake();
        }
    };
    secret = localStorage.getItem("secret") || window.uuid.v4();
    localStorage.setItem("secret", secret);
};


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

var my_score = 0;
var nconnectes = 0;

var locked = true;


window.onscroll = function() {
    window.scrollTo(0, 0);
};


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


function update_canvas(snakes, bonus) {
    var pattern_ = context.createPattern(pattern, "repeat");
    
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
    if(window.mobile)
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
    var snake_palette = ["#00ffff", "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#8000ff"];
    // #Draw the snakes
    nconnectes = 0;
    
    for(var i in snakes) {
        nconnectes++;
        
        var snake_speedup = snakes[i].speedup;
        var snake_size = snakes[i].size;
        var counter = snakes[i].size + snakes[i].coords.length - 3;
        
        var lvl=0;
        if(snake_speedup > snake_size) {
            lvl = Math.floor(snake_speedup / snake_size);
            console.log("sp: "+snake_speedup + " | sz: "+snake_size + " | lvl: "+lvl);
            snake_speedup -= snake_size;
        }
        
        for(var ii = 0; ii < snakes[i].coords.length - 1;ii++) {
            var cxstart = snakes[i].coords[ii][0];
            var cxend = snakes[i].coords[ii+1][0];
            var swap = false, swapy = false;
            
            if(cxstart > cxend) {
                swap = true;
            }
            
            var cystart = snakes[i].coords[ii][1];
            var cyend = snakes[i].coords[ii+1][1];
            
            if(cystart > cyend) {
                swapy = true;
            }
            
            for(var ix = cxstart; ((ix <= cxend)&&(!swap)) || ((ix >= cxend)&&(swap)); swap ? ix-- : ix++) {
                for(var iy = cystart; ((iy <= cyend)&&(!swapy)) || ((iy >= cyend)&&(swapy)); swapy ? iy-- : iy++) {
                    
                    
                    
                    if(snake_speedup > counter) {
                        context.fillStyle = snake_palette[lvl+1];
                    } else {
                        context.fillStyle = snake_palette[lvl];
                    }
                    
                    counter--;
                    context.fillRect(ix*sq_w-position_x+offset_x, iy*sq_w-position_y+offset_y, sq_w, sq_w);
           
                }
            }
            
           
        }
    }
    
}

function draw_bonuses (bonus) {
    // #Draw bonuses
    for(var i in bonus) {
        if(bonus[i] !== null) {
            var cx = bonus[i][0][0];
            var cy = bonus[i][0][1];
            
            if(bonus[i][1] === 0)
                context.fillStyle = "#ffaa00";
            else if(bonus[i][1] == 1)
                context.fillStyle = "#ffaaaa";
                
            context.fillRect(cx*sq_w-position_x+offset_x, cy*sq_w-position_y+offset_y, sq_w, sq_w);
        }
    }
}

function draw_names (snakes) {
    // #Draw names
    var tw = 0;
    for(var i in snakes) {
        if(visible(snakes[i])) {
            var sx, sy;
            var tx, ty;
            sx = snakes[i].coords[0][0];
            sy = snakes[i].coords[0][1];
            
            context.fillStyle = "rgb(66, 66, 66)";
            context.font = "16px Helvetica";
            
            tw = context.measureText(snakes[i].name).width;
            
            tx = Math.round(sx*sq_w-position_x+offset_x - tw/2);
            ty = Math.round(sy*sq_w-position_y+offset_y - sq_w*1.5);
            
            
            context.fillRect(tx-2, ty-16, tw + 4, 20);
        
            context.fillStyle = "#ffffff";
            context.fillText(snakes[i].name, tx, ty);
        } else {
            var dists = getDistanceFromCenter(snakes[i]);
            var dx = dists[0];
            var dy = dists[1];
            
            
            var drawx, drawy;
            
            if((Math.abs(dx)<600) && (Math.abs(dy) < 600)) {
                var flagx,flagy;
                var ofsx, ofsy;
                
                context.font = "18px Helvetica";
                context.fillStyle = "#ffffff";
                
                var dist = Math.round(Math.sqrt(dx*dx + dy*dy));
                tw = context.measureText(dist).width;
                
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
                
                
                context.fillText(dist, Math.round(drawx + ofsx), Math.round(drawy + ofsy));
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

function spawn_snake() {
    var pseudo = document.getElementById('daniel').value;
        
    localStorage.setItem("pseudo", pseudo);
    
    if(spawned) {
        return;
    }
    
    spawned = true;
    var c = [[Math.round( (position_x+canvas.width/2)/sq_w), Math.round((position_y+canvas.height/2)/sq_w)]];
    
	if(pseudo === "") {
		pseudo = "Jack Banane";
	}

	socket.emit("spawn", {"secret":secret, "name": pseudo, "pos":c}, function(data){
        if (data === "ko"){
            spawned = false;
        } else {
            document.getElementById("spawndiv").className = 'hide';
            my_id = data;
        }
    });
}

function centerOnSnake(id) {
    var cx = last_snakes[id].coords[0][0];
    var cy = last_snakes[id].coords[0][1];
    
    var px = cx * sq_w;
    var py = cy * sq_w;
    
    position_x = px - width/2;
    position_y = py - height/2;
}

function followSnake(id) {
    if(last_snakes === undefined)
        return;
    if(last_snakes[id] === undefined)
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
        position_x = position_x - sq_w;
        if(px < position_x + paddingx)
            anim = true;
    } else if(px > position_x + width) {
        centerOnSnake(id);
        return;
    } else if(px > position_x + width - paddingx) {
        position_x = position_x + sq_w;
        if(px > position_x + width - paddingx)
            anim = true;
    }
    
    if(py < position_y) {
        centerOnSnake(id);
        return;
    } else if(py < position_y + paddingy) {
        position_y = position_y - sq_w;
        if(py < position_y + paddingy)
            anim = true;
    } else if(py > position_y + height) {
        centerOnSnake(id);
        return;
    } else if(py > position_y + height - paddingy) {
        position_y = position_y + sq_w;
        if(py > position_y + height - paddingy)
            anim = true;
    }
    update_canvas(last_snakes, last_bonus);
}

function lock() {
    locked = true;
    document.getElementById('button_locked').style.display = "block";
    document.getElementById('button_lock').style.display = "none";
}

function unlock() {
    locked = false;
    document.getElementById('button_locked').style.display = "none";
    document.getElementById('button_lock').style.display = "block";
}

function isLocked() {
    return locked;
}
