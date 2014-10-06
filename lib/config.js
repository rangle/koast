/** @module koast/config */
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
var log = require('./log');
var shortstop = require('shortstop');
var handlers = require('shortstop-handlers');
var shortresolve = require('shortstop-resolve');
var Q = require('q');
var path = require('path');
var confit = require('confit');

var config = {};

var whenReady = Q.defer();

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
  return path.join(prefix, 'config');
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

  var deferred, appFactory, baseFactory, baseOptions, appOptions, basePromise,
    appPromise;
  deferred = Q.defer();


  var koastDir = configPath(path.dirname(__dirname));
  var appDir = configPath(options.appBasedir) || configPath(process.cwd());


  baseOptions = {
    basedir: options.basedir || koastDir,
    defaults: options.file || 'app.json'
  };

  log.verbose('koast-base logging options:', baseOptions);


  appOptions = {
    basedir: appDir,
    defaults: options.file || 'app.json'
  };

  log.verbose('koast application-level logging options', appOptions);

  baseOptions.protocols = getShortstopHandlers(baseOptions);

  baseOptions.protocols.resolve = shortresolve(baseOptions.basedir);

  appOptions.protocols = getShortstopHandlers(appOptions);
  appOptions.protocols.resolve = shortresolve(appOptions.basedir);


  baseFactory = confit(baseOptions);
  appFactory = confit(appOptions);

  basePromise = Q.nbind(baseFactory.create, baseFactory);
  appPromise = Q.nbind(appFactory.create, appFactory);
  return Q.all([basePromise(), appPromise()]).then(function(results) {
    var baseConfig = results[0];
    var appConfig = results[1];

    baseConfig.merge(appConfig);
    config = baseConfig;
    return config;

  }).then(null, log.error);


}

function setConfiguration(environment, options) {
  var koastDir = configPath(path.dirname(__dirname));
  var appDir = configPath(options.appBasedir) || configPath(process.cwd());
  var baseOptions = {};

  options.baseConfiguration = options.baseConfiguration || {};
  options.appConfiguration = options.appConfiguration || {};

  baseOptions = {
    basedir: options.basedir || koastDir,
    defaults: options.file || 'app.json'
  };


  // create completly empty configuation to start with
  var factory = confit(baseOptions).addOverride({
    app: ''
***REMOVED***

  var configCreate = Q.nbind(factory.create, factory);

  return configCreate().then(function(baseConfig) {
    baseConfig.use(options.baseConfiguration);
    baseConfig.use(options.appConfiguration);
    config = baseConfig;
    return config;
***REMOVED***

}

function loadConfiguration(newEnvironment, options) {
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
    log.verbose('Setting enviroment to', environment);

    cachedConfigs = {};
    options.appBasedir = configDirectory || process.cwd();

    if (options.baseConfiguration || options.appConfiguration) {
      log.info('Setting configuration from explicitly set options');
      return setConfiguration(environment, options);
    } else {
      return loadConfig(environment, options).then(function(result) {
        whenReady.resolve(result);
        return result;
  ***REMOVED***
    }


  }
}


/**
 * @function loadConfiguration
 * @static
 * Loads the configuration for an enviroment.
 * Will load the base koast configuration from koast/config/app.json and merge in the application level configuration.
 * If no paramaters are defined, will look in your application/config/app.json for common settings, and will merge in
 * application/config/enviornment.json settings for application and environment specific settings.
 * @param {string} [newEnvironment] - name of environment to load configuration for.  If no paramater is passed, will default to NODE_ENV or development.
 * @param {object} [options] - options to pass into
 * @param {boolean} [options.force] - force configuration to reload even after the environment has been defined
 * @param {object} [options.baseConfiguration] - force application to use provided configuration as base settings
 * @param {object} [options.appConfiguration] - force application to use provided configuration as application settings
 * @returns a {Promise} of the configuration object
 *
 * @example Using default configuration options
 *
 * koast.config
 * .loadConfiguration()
 * .then(koast.serve)
 *
 * @example Specifying configuration to use explicitly - useful for setting up tests without needing to manage configuration files
 *
 * var options = {
 *  force: true,
 *  appConfiguration: {
 *    app: {
 *     port: 2601,
 *     someKey: 'myValue'
 *    }
 *  }
 * };
 *
 * koast.config.loadConfiguration('myTest',options)
 * .then(koast.serve)
 */
exports.loadConfiguration = loadConfiguration;

/** Promise that resolves when application is ready
 * @example
 * koast.config.loadConfiguration();
 * koast.config.whenReady(function()
 * {
 * // stuff that relies on configuration being loadede
 * }
 **/
exports.whenReady = whenReady.promise;
/**
 * Set base path for config directory.
 * @param  {String}  newConfigDirectory  The new config directory
 * @param  {Object}  options             Options of some sort. (TODO figure this out)
 */
exports.setConfigDirectory = function(newConfigDirectory, options) {
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
exports.getConfig = function(key, ignoreCache) {

  try {
    var result = config.get(key);
    if (!result) {
      // TODO: figure out what to do when loading config that wasn't there during
      // app init.
      var path = process.cwd() + '/config/' + environment + '/' + key +
        '.json';
      result = readJsonFromFile(path);
      config.set(key, result);
    }

    return config.get(key);
  } catch (err) {
    log.error('Error occured in getConfig, did you wait for the ' +
      'configuration loader to finish? Remember: ' +
      'koast.config.loadConfiguration() returns a promise!');
    log.error(err);
  }
};