
global.fs = require('fs');
global.path = require('path');
global.readline = require('readline');

global.async = require('async');

if (typeof __DEFINE_NATIVE_REQUIRE__ === 'undefined')
{
  global.__non_webpack_require__ = require;
}


process.on("message", function (msg)
{
    process.send(true);
});

