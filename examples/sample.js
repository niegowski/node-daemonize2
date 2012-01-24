
var http = require("http"), 
    util = require("util");


http.createServer(function(req, res) {
    util.log("Req from " + req.connection.remoteAddress);
    
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    
    res.end("Hello World");
    
}).listen(8080);

util.log("Started");

process.on("SIGUSR1", function() {
    util.log("Reloading...");
});
