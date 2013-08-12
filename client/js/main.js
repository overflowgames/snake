
var canvas = document.getElementById('app');
if(!canvas) {
    alert("Impossible de récupérer le canvas");
    return;
}

canvas.width = 500;
canvas.height = 500;

var context = canvas.getContext('2d');
if(!context) {
    alert("Impossible de récupérer le context du canvas");
    return;
}
 
 
var position_x=-145;
var position_y=-145; 

var offset_x=0;
var offset_y=0; 

var height = 500;
var width = 500;

var sq_w=10;
var my_id=0;

var last_snakes, last_bonus;

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
    context.fillText("x: "+position_x, 30, 30);
    context.fillText("y: "+position_y, 30, 50);
}

function update_canvas(snakes, bonus) {
    // #Generate random bonus (normally server side, but here for testing purpose)
    if (Math.random() < ((-Math.abs(1 / controller.getNumSnakes())) + 1)) {
        var id = uuid.v4();
        controller.addBonus(id, genBonusCoords());
    }
    
    
    
    
    // #Get the viewport dimensions
    update_dimensions();
    
    // #Reset the canvas
    context.fillStyle = "#3B5998";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // #Draw the snakes
    for(var i in snakes) {
        for(var ii = 0; ii < snakes[i].coords.length;ii++) {
            var cx = snakes[i].coords[ii][0];
            var cy = snakes[i].coords[ii][1];
            
           context.fillStyle = "#00ffff";
           context.fillRect(cx*sq_w-position_x+offset_x/*-(position_x%sq_w)*/, cy*sq_w-position_y+offset_y/*-(position_y%sq_w)*/, sq_w, sq_w);
        }
    }
    
    
    // #Draw the grid
    context.strokeStyle = "#ffffff";
    context.lineWidth=0.5;
    draw_grid();
    
    // #Draw the HUD
    draw_hud();
    
}


var controller = new Controller({
    callbacks: {
        update: function (snakes, bonus) {
            last_snakes=snakes;
            last_bonus=bonus;
            update_canvas(snakes, bonus);
        },
        eaten_bonnus: function (id) { },
        add_points: function (id, score) { },
        add_bonus: function (id, coords) { },
        add_snake: function (id, coords, direction, score, size) { },
        killed_snake: function (id) {
            alert("THE SNAKE IS A LIE THE SNAKE IS A LIE THE SNAKE IS A LIE");
            
        },
        change_direction: function (id, direction) {}
    },
    points_bonnus: 10,
    update_rate: 5
});


var c = [[4,2]];
controller.addSnake(my_id,c, "d",0,42);



document.onkeydown = function(event) {
    event = event || window.event; 
    switch (event.keyCode) {
        case 37:// left
            position_x--;
            controller.changeDirection(0, "l");
            break;
        case 38://up
            position_y--;
            controller.changeDirection(0, "u");
            break;
        case 39://right
            position_x++;
            controller.changeDirection(0, "r");
            break;
        case 40://down
            position_y++;
            controller.changeDirection(0, "d");
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