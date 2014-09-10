/**
 * @module koast/config
 */

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

var commonConfigDir = 'common'; //TODO ability to set this
var commonConfig = {};

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

function getFullCommonConfigFilePath(subpath) {
  /*jshint expr:true */
  demandEnvironment();
  expect(subpath).to.not.be.undefined;
  return (configDirectory || 'config') + '/' + commonConfigDir +
    '/' + subpath;

}

function readJsonFromFile(fullPath) {
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath));
  }
}

function loadEnvConfig(key) {
  var fullPath = getFullConfigFilePath(key + '.json');
  return readJsonFromFile(fullPath);
}

// Loads common configuration files into cache
function loadCommonConfig(key) {
  var fullPath = getFullCommonConfigFilePath(key + '.json');
  return readJsonFromFile(fullPath);
}

function combineConfig(env, common) {
  // Overwrite common properties with env properties, add env to common too
  for(var prop in env) {
    //this check isn't necessary when reading from file
    if(env.hasOwnProperty(prop)) { 
      common[prop] = env[prop];
    }
  }

  return common;
}

function loadConfig(key) {
  var commonConfig = loadCommonConfig(key) || {};
  var envConfig = loadEnvConfig(key) || {};
  return combineConfig(loadEnvConfig(key), commonConfig);
}


/**
 * Somebody please explain what this does.
 * @param  {Type}  newEnvironment  Does stuff.
 * @param  {Type}  options         Also does stuff.<D-r>
 */
exports.setEnvironment = function (newEnvironment, options) {
  options = options || {};
  if (environment && !options.force) {
    throw new Error('Cannot change the environment once it was set.');
  } else {
    if (!newEnvironment) {
      newEnvironment = process.env.NODE_ENV || 'local';
    }
    environment = newEnvironment;
    loadCommonConfig();
  }
  cachedConfigs = {};
};


/**
 * Set base path for config directory.
 * @param  {String}  newConfigDirectory  The new config directory
 * @param  {Object}  options             Options of some sort. (TODO figure this out)
 */
exports.setConfigDirectory = function (newConfigDirectory, options) {
  options = options || {};
  if (configDirectory && !options.force) {
    throw new Error('Cannot change the config directory once it was set.');
  } else {
    configDirectory = newConfigDirectory;
  }
};

/**
 * Get a specific set of configuration values from cache or a file.
 * @param  {String}  key  Name of configuration you want.
 * @param  {boolean}  ignoreCache  Skip the cache and load the configuration
 *                                 directly from disk.
 */
exports.getConfig = function (key, ignoreCache) {
  var commonConfig;

  if (ignoreCache){
    // Combine with commons
    return loadConfig(key);
  }

  cachedConfigs[key] = cachedConfigs[key] || loadConfig(key);
  return cachedConfigs[key];
};


