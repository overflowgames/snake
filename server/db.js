var redis = require("redis"),
    logentries = require('node-logentries'),
    async = require("async");

/*var log = logentries.logger({
  token:process.env.LOGENTRIES_TOKEN
});

var add_queue = async.queue(function (id, cb) {
            client.set(id, 0, function(){
                cb();
            });
}, 3);

var score_queue = async.queue(function(task, cb) {
    client.set(task.id, (parseInt(task.score, 10) + parseInt(task.reply, 10)), function () {
        cb();
    });
}, 3);

var services = JSON.parse(process.env.VCAP_SERVICES);

var client = redis.createClient(parseInt(services["redis-2.2"][0]["credentials"]["port"],10), services["redis-2.2"][0]["credentials"]["host"]);
client.auth(services["redis-2.2"][0]["credentials"]["password"]);

client.on("error", function(err) {
    log.crit("Redis Error: " + err);
});*/

function push_score(id, score, cb) {
/*    client.get(id, function (err, reply) {
        if (reply !== null){
            score_queue.push({"score": score, "reply": reply, "id":id});
        } else {
            log.warning("Redis Error: Impossible to update snake score, id "+id+" does not exist in database");
        }
    });*/
}

function add_player_if_not_exists(id, cb){
/*    client.get(id, function (err, reply) {
        if (reply === null){
            add_queue.push(id, cb);
            log.info("Added player " + id);
        }
    });*/
    cb();
}

module.exports.add_player_if_not_exists = add_player_if_not_exists;
module.exports.push_score = push_score;
