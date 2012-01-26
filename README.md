About
=======

Node module for easy creation of daemons


Installation
==============

$ npm install daemonize


Changelog
===========

### 0.2.1 - Jan 26 2012
  - fix for calling callback in stop/kill when process is not running

### 0.2.0 - Jan 26 2012
  - code refactor
  - stop listening for uncaughtException
  - logfile removed

### 0.1.2 - Jan 25 2012
  - fixed stdout, stderr replacement
  - checking for daemon main module presence
  - signals change (added custom signals)
  - better log messages
  - gracefull terminate in example app
  - close logfile on process exit

### 0.1.1 - Jan 24 2012
  - print stacktrace for uncaughtException

### 0.1.0 - Jan 24 2012
  - First release 


Example
=========

``` js
    var daemon = require("daemonize").setup({
        main: "sample.js",
        name: "sampleapp",
        user: "www",
        group: "www",
        pidfile: "/var/run/sampleapp.pid"
    });
    
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
            daemon.sendSignal("SIGUSR1");
            break;
                
        case "status":
            daemon.status();
            break;
        
        default:
            console.log("Usage: [start|stop|kill|restart|status]");
    }
```

Documentation
===============


License
=========

(The MIT License)

Copyright (c) 2012 Kuba Niegowski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
