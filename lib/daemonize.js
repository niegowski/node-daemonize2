// Copyright (c) 2012 Kuba Niegowski
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

"use strict";

var fs = require("fs"),
    path = require("path"),
    util = require("util"),
    args = require("./args"),
    constants = require("./constants"),
    spawn = require("child_process").spawn,
    EventEmitter = require("events").EventEmitter;


exports.setup = function(options) {
    return new Daemon(options);
};

var Daemon = function(options) {
    EventEmitter.call(this);
    
    if (!options.main)
        throw new Error("Expected 'main' option for daemonize");
    
    var dir = path.dirname(module.parent.filename),
        main = path.resolve(dir, options.main),
        name = options.name || path.basename(main, ".js");

    if (!this._isFile(main))
        throw new Error("Can't find daemon main module: '" + main + "'");
    
    // normalize options
    this._options = {};
    this._options.main = main;
    this._options.name = name;

    this._options.pidfile = options.pidfile 
                        ? path.resolve(dir, options.pidfile)
                        : path.join("/var/run", name + ".pid");

    this._options.user = options.user || "";
    this._options.group = options.group || "";
    
    this._stopTimeout = options.stopTimeout || 2000;
    
    this._childExitHandler = null;
    this._childStdoutCloseHandler = null;
    this._childStdoutCloseTimer = null;
    
    if (!options.silent)
        this._bindConsole();
};
util.inherits(Daemon, EventEmitter);

Daemon.prototype.start = function() {

    // make sure daemon is not running
    var pid = this._sendSignal(this._getpid());
    
    if (pid) {
        this.emit("running", pid);
        return this;
    }
    
    this.emit("starting");
    
    // check whether we have right to write to pid file
    var err = this._savepid("");
    if (err) {
        this.emit("error", new Error("Failed to write pidfile (" + err + ")"));
        return this;
    }
    
    // spawn child process
    var child = spawn(process.execPath, [
            __dirname + "/wrapper.js"
        ].concat(args.make(this._options))
    );
    pid = child.pid;

    // save pid
    this._savepid(pid);
    
    // redirect child's stdout/stderr
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    // wrapper.js will exit with special exit codes
    child.once("exit", this._childExitHandler = function(code, signal) {
        
        child.stdout.removeListener("close", this._childStdoutCloseHandler);
        clearTimeout(this._childStdoutCloseTimer);
        
        this.emit("error", new Error(
            code > 1 
            ? constants.findExitCode(code)
            : "Module '" + this._options.main + "' stopped unexpected"
        ));
        
    }.bind(this));
    
    // check if it is still running when child's stdout closes  
    child.stdout.once("close", this._childStdoutCloseHandler = function() {
        
        // check it in 100ms in case this is child's exit
        this._childStdoutCloseTimer = setTimeout(function() {
                        
            child.removeListener("exit", this._childExitHandler);
            
            if (this._sendSignal(pid)) {
                this.emit("started", pid);
                    
            } else {
                this.emit("error", new Error("Daemon failed to start"));
            }
            
        }.bind(this), 100);
    }.bind(this));
    
    return this;
};

Daemon.prototype.stop = function() {
    return this._kill(["SIGTERM"]);
};

Daemon.prototype.kill = function() {
    return this._kill(["SIGTERM", "SIGKILL"]);
};

Daemon.prototype.status = function() {
    return this._sendSignal(this._getpid());
};

Daemon.prototype.sendSignal = function(signal) {
    return this._sendSignal(this._getpid(), signal);
};

Daemon.prototype._getpid = function() {
    
    try { 
        return parseInt(fs.readFileSync(this._options.pidfile));
    } 
    catch (err) {
    }
    
    return 0;
};

Daemon.prototype._savepid = function(pid) {

    try {
        fs.writeFileSync(this._options.pidfile, pid + "\n");
    }
    catch (ex) {
        return ex.code;
    }
    return "";
};

Daemon.prototype._sendSignal = function(pid, signal) {
    
    if (!pid) return 0;
    
    try {
        process.kill(pid, signal || 0);
        return pid;
    } 
    catch (err) {
    }
    
    return 0;
};

Daemon.prototype._kill = function(signals) {
    
    var pid = this._sendSignal(this._getpid());

    if (!pid) {
        this.emit("notrunning");
        return this;
    }
    
    this.emit("stopping");
    
    this._tryKill(pid, signals, function(pid) {
        
        // try to remove pid file
        try {
            fs.unlinkSync(this._options.pidfile);
        }
        catch (ex) {}
        
        this.emit("stopped", pid);
        
    }.bind(this));
    
    return this;
};

Daemon.prototype._tryKill = function(pid, signals, callback) {
    
    if (!this._sendSignal(pid, signals.length > 1 ? signals.shift() : signals[0])) {
        if (callback) callback(pid);
        return true;
    }
    
    setTimeout(this._tryKill.bind(this, pid, signals, callback), this._stopTimeout);
    return false;
};

Daemon.prototype._isFile = function(path) {
    
    try {
        var stat = fs.statSync(path);
        if (stat && !stat.isDirectory())
            return true;
    } 
    catch (err) {
    }
    
    return false;
};

Daemon.prototype._bindConsole = function() {
    
    this
        .on("starting", function() {
            console.log("Starting daemon...");
        })
        .on("started", function(pid) {
            console.log("Daemon started. PID: " + pid);
        })
        .on("stopping", function() {
            console.log("Stopping daemon...");
        })
        .on("stopped", function(pid) {
            console.log("Daemon stopped.");
        })
        .on("running", function(pid) {
            console.log("Daemon already running. PID: " + pid);
        })
        .on("notrunning", function() {
            console.log("Daemon is not running");
        })
        .on("error", function(err) {
            console.log("Daemon failed to start:  " + err.message);
        });

};
