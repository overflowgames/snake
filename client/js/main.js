var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth,
    height = w.innerHeight|| e.clientHeight|| g.clientHeight;

var cX=0, cY=0;

var stage = new Kinetic.Stage({
  width: width,
  height: height,
  container: 'app'
});

var layer = new Kinetic.Layer();
var map = [];
for(var i=0;i<width/40;i++)
    map[i] = [];


for(var x=cX-cX%40; x<cX+width-40;x+=40) {
    for(var y=cY-cY%40; y<cY+height-40;y+=40) {
        if (typeof map[x/40][y/40] === "undefined"){
            var t = new Kinetic.Rect({
                  x: x,
                  y: y,
                  width: 39,
                  height: 39,
                  fill: '#00e2ff',
                  stroke: 'black',
                  strokeWidth: 1
            });
            layer.add(t);
            
            map[x/40][y/40]=t;
        }
    }
}


            
var controller = new Controller({
    callbacks: {
        update: function (snakes, bonus) {
            for(var i in snakes) {
                
            }
        },
        eaten_bonnus: function (id) { },
        add_points: function (id, score) { },
        add_bonus: function (id, coords) { },
        add_snake: function (id, coords, direction, score, size) { },
        killed_snake: function (id) {},
        change_direction: function (id, direction) {}
    },
    points_bonnus: 10,
    update_rate: 5
});
stage.add(layer);
