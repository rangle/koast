/* global require, exports */

'use strict';

var appMaker = require('./lib/app/appMaker');
var config = require('./lib/config');
var dbUtils = require('./lib/database/dbUtils');
var logger = require('./lib/log');
var mongoMapper = require('./lib/mongoMapper/mongoMapper');
var s3upload = require('./lib/aws/s3upload.js');
var mailer = require('./lib/mailer');
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



