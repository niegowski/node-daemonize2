
var daemon = require("daemonize").setup({
    main: "app.js",
    name: "sampleapp",
    pidfile: "sampleapp.pid"
});

switch (process.argv[2]) {
    
    case "start": 
        daemon.start().once("started", function() {
            process.exit();
        });
        break;
    
    case "stop":
        daemon.stop();
        break;
    
    default:
        console.log("Usage: [start|stop]");
}
