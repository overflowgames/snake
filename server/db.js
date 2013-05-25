var redis = require("redis"),
    client = redis.createClient(),
    logentries = require('node-logentries');

var log = logentries.logger({
  token:process.env.LOGENTRIES_TOKEN
});


client.on("error", function(err) {
    log.error("Redis Error: " + err);
});

function push_score(id, score) {
    client.get(id, function (err, reply) {
        if (reply !== null){
            client.set((parseInt(score, 10) + parseInt(reply, 10)));
        } else {
            log.error("Redis Error: Impossible to update snake score, id "+id+" does not exist in database");
        }
    });
}