/** @namespace koast */
/* global require, exports */

'use strict';

var appMaker = require('./lib/app/app-maker');
var config = require('./lib/config');
var dbUtils = require('./lib/database/db-utils');
var logger = require('./lib/log');
var mongoMapper = require('./lib/mongo-mapper/mongo-mapper');
var s3upload = require('./lib/aws/s3upload.js');
var mailer = require('./lib/mailer');
var koast = exports;

exports.makeExpressApp = appMaker.makeExpressApp;

/**
 * Configuration module TODO
 *
 * @var config
 * @memberof koast
 * @see module:koast/config
 */
exports.config = config;
//exports.config.setEnvironment = config.setEnvironment;
//exports.config.setConfigDirectory = config.setConfigDirectory;
//exports.config.getConfig = config.getConfig;

/**
 * Database module TODO
 *
 * @var db
 * @memberof koast
 * @see module:koast/db
 */
exports.db = dbUtils;
//exports.db.createDatabaseConnections = dbUtils.createConfiguredConnections;*/
//exports.db.getDatabaseConnectionPromise = dbUtils.getConnectionPromise;
//exports.db.getDatabaseConnectionNow = dbUtils.getConnectionNow;
//exports.db.getConnectionHandles = dbUtils.getConnectionHandles;

/**
 * Mailer module TODO
 *
 * @var mailer
 * @memberof koast
 * @see module:koast/mailer
 */
exports.mailer = mailer;
//exports.mailer.makeMailer = mailer.mailerMaker;

exports.mapper = {};
exports.mapper.makeMongoMapper = mongoMapper.makeMapper;

exports.aws = {};
exports.aws.makeS3FileUploader = s3upload.makeS3FileUploader;

exports.getLogger = function() {
  return logger;
};

/**
 * Run the webserver.
 *
 * @function serve
 * @memberof koast
 */
exports.serve = function () {
  var log = koast.getLogger();

  koast.createDatabaseConnections()
    .then(function (connection) {
      var appConfig = koast.getConfig('app');
      var portNumber = Number(process.env.PORT || appConfig.portNumber);
      var app = koast.makeExpressApp();
      app.listen(portNumber);
      log.info('Listening on ', portNumber);
    })
    .then(null, function (error) {
      log.error('Error:', error);
      if (error.stack) {
        log.error(error.stack);
***REMOVED***
***REMOVED***
};




