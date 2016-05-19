var http = require("http");

http.createServer(function(req, res) {
    console.log("Beginning request.");

    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end("Hello World");

    console.log("Ending request.");
}).listen(8080);

setInterval(function () {
  console.error("A theoretical error!");
}, 1000);
