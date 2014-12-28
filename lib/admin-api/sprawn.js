'use strict';

var q = require('q');
var cpSpawn = require('child_process').spawn;

function runProc(cmd, args, cb) {
  var d = q.defer();
  var proc = cpSpawn(cmd, args);
  proc.on('close', cb(proc, d));
  return d.promise;
}

function exec(cmd, args) {
  function handlePromise(proc, deferred) {
    return function (code) {
      if(code === 0) {
        deferred.resolve(proc);
      } else {
        deferred.reject(proc);
      }
    };
  }

  return runProc(cmd, args, handlePromise);
}

function resolve(cmd, args) {
  function handlePromise(proc, deferred) {
    return function (code) {
      deferred.resolve(proc);
    };
  }

  return runProc(cmd, args, handlePromise);
}

exports = module.exports = {
  exec: exec,
  resolve: resolve
};
