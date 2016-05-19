var fs = require('fs');

var daemon = require("daemonize2").setup({
    main: "app.js",
    name: "sampleapp",
    pidfile: "sampleapp.pid"
});

var outFile = "sampleapp.out.log";
var errFile = "sampleapp.err.log";

switch (process.argv[2]) {

    case "start":
        var outStream = fs.createWriteStream(outFile);
        var errStream = fs.createWriteStream(errFile);

        outStream.on('open', function () {
            errStream.on('open', function () {
                daemon.start(undefined, {
                    stdout: outStream,
                    stderr: errStream
                });
            });
        });

        break;

    case "stop":
        daemon.stop();
        break;

    default:
        console.log("Usage: [start|stop]");
}
