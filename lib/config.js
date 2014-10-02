/** @module koast/config */
// A config loader module.
//
// This should not actually contain any configurations, but rather provides a
// getConfig(key) method that would retrieves specific configurations from
// files.
'use strict';
var fs = require('fs');
var expect = require('chai').expect;
var environment;
var configDirectory;
var cachedConfigs = {};
var commonConfigDir = 'common'; //TODO ability to set this
var commonConfig = {};
var log = require('./log')
var shortstop = require('shortstop');
var handlers = require('shortstop-handlers');
var shortresolve = require('shortstop-resolve');
var Promise = require('q');
var path = require('path');
var confit = require('confit');

var config = {};


function demandEnvironment() {
  if (!environment) {
    throw 'Environment is not set.';
  }
}

function readJsonFromFile(fullPath) {
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath));
  }
}

function configPath(prefix) {
  return path.join(prefix, 'config')
}

function getShortstopHandlers(options) {
  var result;
  result = {
    file: handlers.file(options.basedir),
    path: handlers.path(options.basedir),
    base64: handlers.base64(),
    env: handlers.env(),
    require: handlers.require(options.basedir),
    exec: handlers.exec(options.basedir),
    glob: handlers.glob(options.basedir)
  };
  return result;
}

function loadConfig(enviroment, options) {

  var deferred, appFactory, baseFactory, baseOptions, appOptions;
  deferred = Promise.defer();

  var koastDir = configPath(path.dirname(__dirname));
  var appDir = configPath(options.appBasedir) || configPath(process.cwd());


  var baseOptions = {
    basedir: options.basedir || koastDir,
    defaults: options.file || 'app.json'
  };

  log.verbose('koast-base logging options:', baseOptions);


  var appOptions = {
    basedir: appDir,
    defaults: options.file || 'app.json'
  }

  log.verbose('koast application-level logging options', appOptions);

  baseOptions.protocols = getShortstopHandlers(baseOptions);

  baseOptions.protocols.resolve = shortresolve(baseOptions.basedir);

  appOptions.protocols = getShortstopHandlers(appOptions);
  appOptions.protocols.resolve = shortresolve(appOptions.basedir);


  baseFactory = confit(baseOptions);

  appFactory = confit(appOptions);



  baseFactory.create(function (err, baseConfig) {

    if (err) {
      log.failure('Error loading base configuration:', err);
      deferred.reject(err);
      return;
    }

    appFactory.create(function (err,
      appConfig) {
      if (err) {
        log.failure('Error loading app configuration:', err);
        deferred.reject(err);
        return;
      }

      baseConfig.merge(appConfig);
      config = baseConfig;
      deferred.resolve(baseConfig);

      return baseConfig;
    });
    return;
  });

  return deferred.promise;
}

/***
 * Somebody please explain what this does.
 * @param {Type} newEnvironment Does stuff.
 * @param {Type} options Also does stuff. np< D - r >
 **/

exports.setEnvironment = function (newEnvironment, options) {
  options = options || {};
  if (environment && !options.force) {
    throw new Error('Cannot change the environment once it was set.');
  } else {
    if (!newEnvironment) {
      newEnvironment = process.env.NODE_ENV || 'dev';
    } else {
      environment = process.env.NODE_ENV = newEnvironment;
    }
    environment = newEnvironment;
    log.verbose("Setting enviroment to", environment);

    cachedConfigs = {};
    options.appBasedir = configDirectory || process.cwd();

    return loadConfig(environment, options);
  }

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

  try {
    var result = config.get(key);
    if (!result || ignoreCache) {
      // TODO: figure out what to do when loading config that wasn't there during
      // app init.
      var path = process.cwd() + '/config/' + environment + '/' + key + '.json';
      result = readJsonFromFile(path);
      config.set(key, result);
    }

    return config.get(key);
  } catch(err) {
    console.log('Error occured in getConfig, did you wait for the ' +
                'configuration loader to finish? Remember: ' +
                'koast.config.setEnvironment() returns a promise!');
    console.log(err);
  }
};
