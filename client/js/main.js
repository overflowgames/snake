var socket = io.connect('https://snake-c9-jmouloude42.c9.io/');
var controller;



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
var ma_direction="u"; // CEY MA DIRAYCTION! JAY PAYTAY LAY PLOMB ////

var last_snakes, last_bonus;

var padding = 150;


function draw_grid() {

    for(var x=(-position_x+offset_x)%sq_w; x<=width;x+=sq_w) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
        context.closePath();
    }
    
    for(var y=(-position_y+offset_y)%sq_w; y<=height;y+=sq_w) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
        context.closePath();
    }
}

function update_dimensions(){
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    win_x = w.innerWidth || e.clientWidth || g.clientWidth,
    win_y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    
    height = win_y;
    width = win_x;
    
    canvas.height = win_y;
    canvas.width = win_x;
}

function draw_hud() {
    context.font = "18px Helvetica";//On passe à l'attribut "font" de l'objet context une simple chaîne de caractères composé de la taille de la police, puis de son nom.
    context.fillStyle = "#ffffff";
    
    var cx = Math.round((position_x+canvas.width/2)/sq_w);
    var cy = Math.round((position_y+canvas.height/2)/sq_w);
    
    context.fillText("x: "+cx, 30, 30);
    context.fillText("y: "+cy, 30, 50);
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
    context.fillRect(-offx,-offy,canvas.width+Math.abs(offx),canvas.height+Math.abs(offy));
    context.translate(-offx, -offy);
    
    // #Draw the snakes
    for(var i in snakes) {
        for(var ii = 0; ii < snakes[i].coords.length;ii++) {
            var cx = snakes[i].coords[ii][0];
            var cy = snakes[i].coords[ii][1];
            
           context.fillStyle = "#00ffff";
           context.fillRect(cx*sq_w-position_x+offset_x, cy*sq_w-position_y+offset_y, sq_w, sq_w);
           
        }
    }
    
    // #Draw bonuses
    for(var i in bonus) {
        var cx = bonus[i][0];
        var cy = bonus[i][1];
        
        context.fillStyle = "#ffaa00";
        context.fillRect(cx*sq_w-position_x+offset_x, cy*sq_w-position_y+offset_y, sq_w, sq_w);
    }
    
    
    // #Draw the grid
    context.strokeStyle = "#ffffff";
    if(mobile)
        context.lineWidth=1;
    else 
        context.lineWidth=0.5;
    draw_grid();
    
    // #Draw names
    for(var i in snakes) {
        var sx, sy;
        var tx, ty;
        sx = snakes[i].coords[0][0];
        sy = snakes[i].coords[0][1];
        
        context.fillStyle = "#424242";
        context.font = "16px Helvetica";
        
        var tw = context.measureText(snakes[i].name).width;
        
        tx = sx*sq_w-position_x+offset_x - tw/2;
        ty = sy*sq_w-position_y+offset_y - sq_w*1.5;
        
        
        context.fillRect(tx-2, ty-16, tw + 4, 20);
    
        context.fillStyle = "#ffffff";
        context.fillText(snakes[i].name, tx, ty);
        
    }
    
    
    // #Draw the HUD
    draw_hud();
}


socket.emit("login", "dan", function(data){
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
                    //alert("THE SNAKE IS A LIE THE SNAKE IS A LIE THE SNAKE IS A LIE");
                    $("#spawndiv").slideDown();
                } else {
                    console.log(id + " vs " + my_id);
                }
                
            },
            change_direction: function (id, direction) {
                /*if (id === my_id){
                    socket.emit("c", {"id":my_id, "secret":"dan", "direction": direction}, function(data){});
                }*/
            }
        },
        points_bonnus: 10,
        disable_update: true,
        update_rate: 10
    });
    $("#spawndiv").slideDown();
});

socket.on("+", function(data){
    if (data[0] != my_id){
        controller.addSnake(data[0],data[1], data[2],data[3],data[4],data[5]);
    }
});

socket.on("+b", function(data){
        controller.addBonus(data[0],data[1]);
})

socket.on("-", function(data){
        controller.killSnake(data);
});

socket.on("up", function(data){
        controller.load(data.snakes, data.bonus);
});

socket.on("c", function(data){
    controller.changeDirection(data[0],data[1]);
});

socket.on("u", function(data){
    if(controller != undefined)
        controller.update();
});


$('#daniel').keyup(function (e) {
    if (e.keyCode === 13) {
       spawn_snake();
    }
});
  
  
function spawn_snake() {
    var c = [[Math.round( (position_x+canvas.width/2)/sq_w), Math.round((position_y+canvas.height/2)/sq_w)]]
    socket.emit("spawn", {"id":my_id, "secret":"dan", "name":document.getElementById('daniel').value, "pos":c}, function(data){
        if (data === "ko"){
            console.log("Y'a une couille avec le secret !!!");
        }
        
        controller.addSnake(my_id,c, "u",0,20,document.getElementById('daniel').value);
        centerOnSnake(my_id);
        
        $("#spawndiv").slideUp();
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
    
    anim=false;
    
    if(px < position_x) {
        centerOnSnake(id);
        return;
    } else if(px < position_x + padding) {
        position_x = position_x - 3;
        if(px < position_x + padding)
            anim = true;
    } else if(px > position_x + width) {
        centerOnSnake(id);
        return;
    } else if(px > position_x + width - padding) {
        position_x = position_x + 3;
        if(px > position_x + width - padding)
            anim = true;
    }
    
    if(py < position_y) {
        centerOnSnake(id);
        return;
    } else if(py < position_y + padding) {
        position_y = position_y - 3;
        if(py < position_y + padding)
            anim = true;
    } else if(py > position_y + height) {
        centerOnSnake(id);
        return;
    } else if(py > position_y + height - padding) {
        position_y = position_y + 3;
        if(py > position_y + height - padding)
            anim = true;
    }
    update_canvas(last_snakes, last_bonus);
}

document.onkeydown = function(event) {
    event = event || window.event; 
    switch (event.keyCode) {
        case 37:// left
            socket.emit("c", {"id":my_id, "secret":"dan", "direction": "l"}, function(data){ma_direction=data[1]});
            break;
        case 38://up
            socket.emit("c", {"id":my_id, "secret":"dan", "direction": "u"}, function(data){ma_direction=data[1]});
            break;
        case 39://right
            socket.emit("c", {"id":my_id, "secret":"dan", "direction": "r"}, function(data){ma_direction=data[1]});
            break;
        case 40://down
            socket.emit("c", {"id":my_id, "secret":"dan", "direction": "d"}, function(data){ma_direction=data[1]});
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