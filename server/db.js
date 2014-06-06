/*jslint node: true */
var async = require("async"),
    fs = require("fs");


var filename = "scores.json";

fs.exists(filename, function (exists) {
    'use strict';
    if (!exists) {
        fs.writeFile(filename, "{}");
    }
});

var queue = async.queue(function (task, cb) {
    'use strict';
    fs.readFile(filename, function (err, data) {
        if (err) {
            return false;
        }
        var players = JSON.parse(data);
        switch (task.action) {
        case "add":
            if (players[task.id] === undefined) {
                players[task.id] = {score: 0};
                fs.writeFile(filename, JSON.stringify(players), function (err) {
                    if (!err) {
                        cb(0);
                    }
                });
            } else {
                cb(players[task.id].score);
            }
            break;
        case "push":
            players[task.id].score = Math.max(parseInt(task.score, 10), players[task.id].score);
            fs.writeFile(filename, JSON.stringify(players), function (err) {
                if (!err) {
                    return false;
                }
                cb(players[task.id].score);
            });
            break;
        case "read":
            if (players[task.id] !== undefined) {
                cb(players[task.id].score);
            }
            break;
        }
    });
}, 3);

function push_score(id, score, cb) {
    'use strict';
    if (typeof score !== "number" || typeof cb !== "function" || score < 0) {
        return false;
    }
    queue.push({action: "push", score: score, id: id}, cb);
    return true;
}

function add_player_if_not_exists(id, cb) {
    'use strict';
    if (typeof cb !== "function") {
        return false;
    }
    queue.push({action: "add", id: id}, cb);
    return true;
}

function read_score(id, cb) {
    'use strict';
    if (typeof cb !== "function") {
        return false;
    }
    queue.push({action: "read", id: id}, cb);
    return true;
}

module.exports.add_player_if_not_exists = add_player_if_not_exists;
module.exports.push_score = push_score;
