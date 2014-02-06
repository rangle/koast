/* global exports, Object */

var path = require('path');
var Module = require('module');

// Requires a module based on a path relative to current working directory.
// Adapted https://github.com/kamicane/require-relative/.
exports.requireRelative = function(requestedPath) {
  var rootPath = process.cwd();
  var rootName = path.join(rootPath, '@root');
  var root = new Module(rootName);
  root.filename = rootName;
  root.paths = Module._nodeModulePaths(rootPath);
  return root.require(requestedPath);
};
