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

#include <v8.h>
#include <node.h>
#include <unistd.h>

using namespace v8;
using namespace node;


Handle<Value> SetSid(const Arguments & args) {
    HandleScope scope;
    return scope.Close(Integer::New(setsid()));
}

Handle<Value> CloseStdio(const Arguments& args) {
    freopen("/dev/null", "r", stdin);
    freopen("/dev/null", "w", stderr);
    freopen("/dev/null", "w", stdout);
}

void init(Handle<Object> target) {
    NODE_SET_METHOD(target, "setsid", SetSid);
    NODE_SET_METHOD(target, "closeStdio", CloseStdio);
}
NODE_MODULE(daemonize, init)
