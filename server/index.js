/* global require, exports */

'use strict';

var appMaker = require('./lib/app/appMaker');
var config = require('./lib/config');
var dbUtils = require('./lib/database/dbUtils');
var logger = require('./lib/log');
var mongoMapper = require('./lib/mongoMapper/mongoMapper');

exports.makeExpressApp = appMaker.makeExpressApp;
exports.setEnvironment = config.setEnvironment;
exports.setConfigDirectory = config.setConfigDirectory;
exports.getConfig = config.getConfig;
exports.createDatabaseConnections = dbUtils.createConfiguredConnections;
exports.getDatabaseConnectionPromise = dbUtils.getConnectionPromise;
exports.getDatabaseConnectionNow = dbUtils.getConnectionNow;

exports.makeMongoMapper = mongoMapper.makeMongoMapper;

exports.getLogger = function() {
  return logger;
};



