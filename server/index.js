/* global require, exports */

'use strict';

var appMaker = require('./lib/app/app-maker');
var config = require('./lib/config');
var dbUtils = require('./lib/database/db-utils');
var logger = require('./lib/log');
var mongoMapper = require('./lib/mongo-mapper/mongo-mapper');
var s3upload = require('./lib/aws/s3upload.js');
exports.makeExpressApp = appMaker.makeExpressApp;
exports.setEnvironment = config.setEnvironment;
exports.setConfigDirectory = config.setConfigDirectory;
exports.getConfig = config.getConfig;
exports.createDatabaseConnections = dbUtils.createConfiguredConnections;
exports.getDatabaseConnectionPromise = dbUtils.getConnectionPromise;
exports.getDatabaseConnectionNow = dbUtils.getConnectionNow;
exports.getConnectionHandles = dbUtils.getConnectionHandles;

exports.makeMongoMapper = mongoMapper.makeMapper;
exports.makeS3FileUploader = s3upload.makeS3FileUploader;

exports.getLogger = function() {
  return logger;
};



