
var http = require("http"), 
    fs = require("fs");

process.chdir(__dirname);
var log = fs.createWriteStream('./x.log', { flags: "a" });

log.write("Starting\n");

var server = http.createServer()
    .on("request", function(req, res) {
        log.write("Req from " + req.connection.remoteAddress + "\n");
        
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });
        
        res.end("Hello World");
        
    })
    .on("close", function() {
        log.write("Server stopped\n");

        log.on("close", function() {
            process.exit(0);
        });
        log.end();
    })
    .listen(8080);
    

log.write("Started\n");


process.on("SIGUSR1", function() {
    log.write("Reloading...\n");
});

process.once("SIGTERM", function() {
    log.write("Stopping...\n");

    server.close();
});
