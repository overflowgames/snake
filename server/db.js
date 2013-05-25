var redis = require("redis"),
    client = redis.createClient(),
    logentries = require('node-logentries');

var log = logentries.logger({
  token:process.env.LOGENTRIES_TOKEN
});


client.on("error", function(err) {
    log.crit("Redis Error: " + err);
});

function push_score(id, score) {
    client.get(id, function (err, reply) {
        if (reply !== null){
            client.set(id, (parseInt(score, 10) + parseInt(reply, 10)));
        } else {
            log.warning("Redis Error: Impossible to update snake score, id "+id+" does not exist in database");
        }
    });
}

function add_player_if_not_exists(id, cb){
    client.get(id, function (err, reply) {
        if (reply === null){
            client.set(id, 0);
            log.info("Added player " + id);
        }
    });
}