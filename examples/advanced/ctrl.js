
var daemon = require("daemonize").setup({
    main: "app.js",
    name: "sampleapp",
    pidfile: "/var/run/sampleapp.pid",
    user: "www",
    group: "www"
});

if (process.getuid() != 0) {
    console.log("Expected to run as root");
    process.exit(1);
}

switch (process.argv[2]) {
    
    case "start": 
        daemon.start(function(err) {
            process.exit();
        });
        break;
    
    case "stop":
        daemon.stop();
        break;
    
    case "kill":
        daemon.kill();
        break;
    
    case "restart":
        daemon.stop(function(pid) {
            daemon.start(function(err) {
                process.exit();
            });
        });
        break;

    case "reload":
        console.log("Reload.");
        daemon.sendSignal("SIGUSR1");
        break;

    case "status":
        daemon.status();
        break;
    
    default:
        console.log("Usage: [start|stop|kill|restart|reload|status]");
}
