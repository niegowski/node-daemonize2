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
    args = require("./args"),
    daemonize = require("../build/Release/daemonize"); 


// parse arguments
var options = args.parse(process.argv.slice(2));

// validate options
if (!options.main) {
    console.error("'main' argument is required");
    process.exit(96);
}

// check if main is resolvable
try {
    require.resolve(options.main);
}
catch (ex) {
    console.error("Specified 'main' module cannot be found (" + options.main + ")");
    process.exit(97);
}

// rename process
if (options.name)
    process.title = options.name;

// change the file mode mask
process.umask(0);

// create new session id
if (daemonize.setsid() < 0) {
    console.error("Failed to create new session id");
    process.exit(98);
}

// change working directory
try {
    process.chdir("/");
}
catch (ex) {
    console.error("Failed to change working directory to root (" + ex.message + ")");
    process.exit(99);
}

// close open FD-s except stdio and ones of unknown type (ie anon_inode)
for (var i = 3; i < 1024; i++) {
    try {
        var stats = fs.fstatSync(i);
        
        if (stats.isFile() || stats.isDirectory() ||
            stats.isBlockDevice() || stats.isCharacterDevice() ||
            stats.isSocket() /*|| stats.isFIFO()*/  
        ) {
            fs.close(i);
        }
    }
    catch (ex) {
    }
}

// change group id
if (options.group) {
    try {
        process.setgid(options.group);
    }
    catch (ex) {
        console.error("Failed to change user group id (" + ex.code + ")");
        process.exit(100);
    }
}

// change user id
if (options.user) {
    try {
        process.setuid(options.user);
    }
    catch (ex) { 
        console.error("Failed to change user group id (" + ex.code + ")");
        process.exit(101);
    }
}

// run main module
require(options.main);

// close stdio
daemonize.closeStdio();

