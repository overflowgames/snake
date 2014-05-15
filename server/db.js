var async = require("async"),
    fs = require("fs");


var filename = "scores.json";

fs.exists(filename, function (exists) {
    if (!(exists)){
        fs.writeFileSync(filename, "{}");
    }
});

var queue = async.queue(function (task, cb) {
    fs.readFile(filename, function(err, data){
        if (err) throw err;
        var players = JSON.parse(data);
        switch(task.action){
            case "add":
                if (typeof players[task.id] === "undefined"){
                    players[task.id] = {score: 0};
                    fs.writeFile(filename, JSON.stringify(players), function(err){
                        if (err) throw err;
                        cb();
                    });
                } else {
                    cb(players[task.id].score);
                }
            break;
            case "push" :
                players[task.id].score += Math.max(parseInt(task.score, 10), players[task.id].score);
                fs.writeFile(filename, JSON.stringify(players), function(err){
                    if (err) throw err;
                    cb();
                });
            break;
            case "read" :
                if (typeof players[task.id] !== "undefined") {
                    cb(players[task.id].score);
                } else {
                    cb();
                }
            break;
        }
    });
}, 3);

function push_score(id, score, cb) {
    if (typeof score !== "number" || typeof cb !== "function" || score < 0){
        return false;
    }
    queue.push({action: "push", score: score, id: id}, cb);
    return true;
}

function add_player_if_not_exists(id, cb){
    if (typeof cb !== "function"){
        return false;
    }
    queue.push({action: "add", id: id}, cb);
    return true;
}

function read_score(id, cb){
    if (typeof cb !== "function"){
        return false;
    }
    queue.push({action: "read", id: id}, cb);
    return true;
}

module.exports.add_player_if_not_exists = add_player_if_not_exists;
module.exports.push_score = push_score;
