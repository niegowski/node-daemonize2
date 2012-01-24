
var http = require("http"), 
    util = require("util");


var server = http.createServer()
    .on("request", function(req, res) {
        util.log("Req from " + req.connection.remoteAddress);
        
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });
        
        res.end("Hello World");
        
    })
    .on("close", function() {
        process.exit(0);
    })
    .listen(8080);
    

util.log("Started");


process.on("SIGUSR1", function() {
    util.log("Reloading...");
});

process.once("SIGTERM", function() {
    util.log("Stopping...");

    server.close();
});
