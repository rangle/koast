// A config loader module.
//
// This should not actually contain any configurations, but rather provides a
// getConfig(key) method that would retrieves specific configurations from
// files.

'use strict';

var fs = require('fs');
***REMOVED***
var environment;
var configDirectory = 'config';
var cachedConfigs = {};

function demandEnvironment() {
  if (!environment) {
    throw 'Environment is not set.';
  }
}

function getFullConfigFilePath(subpath) {
  /*jshint expr:true */
  demandEnvironment();
  expect(configDirectory).to.not.be.undefined;
  expect(subpath).to.not.be.undefined;
  return configDirectory + '/' + environment + '/' + subpath;
}

function readJsonFromFile(subpath) {
  return JSON.parse(fs.readFileSync(getFullConfigFilePath(subpath)));
}

exports.setEnvironment = function (newEnvironment) {
  environment = newEnvironment;
  cachedConfigs = {};
};

exports.setConfigDirectory = function (newConfigDirectory) {
  configDirectory = newConfigDirectory;
};

// function makeJsonLoader(path) {
//   return function () {
//     return readJsonFromFile(path);
//   };
// }

exports.getConfig = function (key) {
  cachedConfigs[key] = cachedConfigs[key] || readJsonFromFile(key + '.json');
  return cachedConfigs[key];
};
