/* global require, exports */

'use strict';

var appMaker = require('./lib/app/appMaker');
var config = require('./lib/config');
var dbUtils = require('./lib/database/dbUtils');
var logger = require('./lib/log');

exports.makeExpressApp = appMaker.makeExpressApp;
exports.setEnvironment = config.setEnvironment;
exports.setConfigDirectory = config.setConfigDirectory;
exports.getConfig = config.getConfig;
exports.createDatabaseConnection = dbUtils.createConnection;
exports.createNamedDatabaseConnection = dbUtils.createNamedConnection;
exports.getDatabaseConnection = dbUtils.getConnection;
exports.getLogger = function() {
  return logger;
};

exports.makeMongoMapper = function (dbConn, collection) {
  return function(req, res) {
    res.send(200, collection);
  }
};

