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
exports.setEnvironment = config.setEnvironment;
exports.setConfigDirectory = config.setConfigDirectory;
exports.getConfig = config.getConfig;
exports.createDatabaseConnections = dbUtils.createConfiguredConnections;
exports.getDatabaseConnectionPromise = dbUtils.getConnectionPromise;
exports.getDatabaseConnectionNow = dbUtils.getConnectionNow;
exports.getConnectionHandles = dbUtils.getConnectionHandles;

exports.makeMailer = mailer.mailerMaker;

exports.makeMongoMapper = mongoMapper.makeMapper;
exports.makeS3FileUploader = s3upload.makeS3FileUploader;

exports.getLogger = function() {
  return logger;
};

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




