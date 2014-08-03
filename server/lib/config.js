// A config loader module.
//
// This should not actually contain any configurations, but rather provides a
// getConfig(key) method that would retrieves specific configurations from
// files.

'use strict';

var fs = require('fs');
***REMOVED***
var environment;
var configDirectory;
var cachedConfigs = {};

function demandEnvironment() {
  if (!environment) {
    throw 'Environment is not set.';
  }
}

function getFullConfigFilePath(subpath) {
  /*jshint expr:true */
  demandEnvironment();
  expect(subpath).to.not.be.undefined;
  return (configDirectory || 'config') + '/' + environment + '/' + subpath;
}

function readJsonFromFile(subpath) {
  var fullPath = getFullConfigFilePath(subpath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath));
  }
}

exports.setEnvironment = function (newEnvironment, options) {
  options = options || {};
  if (environment && !options.force) {
    throw new Error('Cannot change the environment once it was set.');
  } else {
    if (!newEnvironment) {
      newEnvironment = process.env.NODE_ENV || 'local';
    }
    environment = newEnvironment;
  }
  cachedConfigs = {};
};

exports.setConfigDirectory = function (newConfigDirectory, options) {
  options = options || {};
  if (configDirectory && !options.force) {
    throw new Error('Cannot change the config directory once it was set.');
  } else {
    configDirectory = newConfigDirectory;
  }
};

exports.getConfig = function (key) {
  cachedConfigs[key] = cachedConfigs[key] || readJsonFromFile(key + '.json');
  return cachedConfigs[key];
};