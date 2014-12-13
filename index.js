/** @namespace koast */
/* global require */

'use strict';
var yarg = require('yargs');
var appMaker = require('./lib/app/app-maker');
var config = require('./lib/config');
var dbUtils = require('koast-db-utils');
var logger = require('./lib/log');
var mongoMapper = require('mongo-mapper');
var mailer = require('./lib/mailer');
var pushNotifier = require('./lib/push-notifier/push-notifier');
var configCli = require('./lib/cli/config-cli');
var adminApi = require('./lib/admin-api/admin-api');


var koast = exports;

// TODO refactor AWS code?!
var aws = require('koast-aws').s3upload; // pull in koast-aws package
var argv = yarg.argv;
var versionReporter = require('./lib/version-reporter');

require('darudejs-nodestorm');

/**
 * koast router
 *
 * @var koastRouter
 * @memberof koast
 * @see npm package: koast-router
 */
exports.koastRouter = require('koast-router');
exports.makeExpressApp = appMaker.makeExpressApp;

/**
 * Configuration module TODO
 *
 * @var config
 * @memberof koast
 * @see module:koast/config
 */
exports.config = config;

/**
 * @var db
 * @memberof koast
 * @see module:koast/db
 */
exports.db = dbUtils;

/**
 * Mailer module TODO
 *
 * @var mailer
 * @memberof koast
 * @see module:koast/mailer
 */
exports.mailer = mailer;

/**
 * Mongo mapper module TODO
 *
 * @var mongoMapper
 * @memberof koast
 * @see module:koast/mongoMapper
 */
exports.mongoMapper = mongoMapper;

/**
 * AWS utils TODO
 *
 * @var aws
 * @memberof koast
 * @see module:koast/aws
 */
exports.aws = aws;

/**
 * Push notifications module
 *
 * @var pushNotifier
 * @memberof koast
 * @see module:koast/pushNotifier
 */
exports.pushNotifier = pushNotifier;


exports.admin = adminApi;

/**
 * Gets logger
 *
 * @function getLogger
 * @memberof koast
 */
exports.getLogger = function () {
  return logger;
};

/**
 * Configure a koast application
 * @memberof koast
 * @param {string} [env] - environment to use. If not specified, will use process.env.NODE_ENV, or default to development
 * @param {object} [options] - options to use for the application. If not specified, will load up config/app.json and environment specific settings.
 * @return {promise} promise that resolves once configuration is complete. Result of promise will contain the current configuration
 * @example
 * 'use strict';
 *
 * var koast = require('koast');
 * koast.configure()
 * .then(function (config) {
 *    console.log('This is your configuration: ', config);
 * });
 *
 * koast.serve();
 */
exports.configure = function (env, options) {

  if (env && !options && typeof env !== 'string') {
    options = env;
  }
  if (!env) {
    env = process.env.NODE_ENV || 'dev';
  }

  if (options) {
    return koast.config.loadConfiguration(env, options);
  } else {
    return koast.config.loadConfiguration();
  }
};
/**
 * Run the webserver.
 *
 * @function serve
 * @memberof koast
 */
exports.serve = function (options) {

  var log = koast.getLogger();

  return koast.config.whenReady
    .then(configCli)
    .then(function () {
      // config & log now get passed in as db (koast-db-utils) is now it's own module
      return koast.db.createConfiguredConnections(null, null, koast.config,
        log);
    })
    .then(function () {

      versionReporter.globalVersionWarning();

      var appConfig = koast.config.getConfig('app');
      var portNumber = Number(process.env.PORT || appConfig.portNumber);
      var appPromise = koast.makeExpressApp();

      return appPromise.then(function (app) {
        app.listen(portNumber);
        log.info('Listening on ', portNumber);
      });
    })
    .then(null, function (error) {
      log.error('Error:', error);
      if (error.stack) {
        log.error(error.stack);
      }
    });
};
