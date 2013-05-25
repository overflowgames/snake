var redis = require("redis"),
    client = redis.createClient(),
    logentries = require('node-logentries');

var log = logentries.logger({
  token:process.env.LOGENTRIES_TOKEN
});


client.on("error", function(err) {
    log.error("Redis Error: " + err);
});

