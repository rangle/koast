/* global require, exports */

'use strict';

var mongoose = require('mongoose');
var format = require('util').format;
var async = require('async');
var _ = require('underscore');
var Q = require('q');

// mongoose.set('debug', true);

function makeMongoUrl(dbConfig) {
  return format('mongodb://%s:%d/%s', dbConfig.host, dbConfig.port, dbConfig.db);
}

var connectionPromises = {};
var unnamedConnectionPromise;

function createConnection(dbConfig, schemas, callback) {

  var deferred = Q.defer();
  var connection = mongoose.createConnection(makeMongoUrl(dbConfig), function (
    error) {
    if (error) {
      deferred.reject(error);
      return deferred.promise;
    }
***REMOVED***

  connection.on('error', function (error) {
    deferred.reject(error);
***REMOVED***

  var schemaTasks = _.map(schemas, function (schema) {
    return function (callback) {
      var mongooseSchema = new mongoose.Schema(schema.properties, {
        collection: schema.name
  ***REMOVED***
      var model;
      (schema.indices || []).forEach(function (index) {
        mongooseSchema.index(index[0], index[1]);
  ***REMOVED***
      model = connection.model(schema.name, mongooseSchema);
      // model.on('index', function (err) {
      //   if (err) {
      //     // Do something about error during index creation
      //   }
      // ***REMOVED***
      model.ensureIndexes(function (error) {
        if (error) {
          callback(error);
***REMOVED*** else {
          callback();
***REMOVED***
  ***REMOVED***
***REMOVED***
***REMOVED***

  async.series(schemaTasks, function (error) {
    if (error) {
      deferred.reject(error);
    } else {
      if (callback) {
        callback(connection);
***REMOVED***
      deferred.resolve(connection);
    }
***REMOVED***

  return deferred.promise;
};

exports.createConnection = function (dbConfig, schemas, callback) {
  unnamedConnectionPromise = createConnection(dbConfig, schemas, callback);
  return unnamedConnectionPromise;
}

exports.createNamedConnection = function (name, dbConfig, schemas, callback) { 
  var connectionPromise = createConnection(dbConfig, schemas, callback);
  connectionPromises[name] = connectionPromise;
  return connectionPromise;
}

exports.getConnection = function (name) {

  var promise;

  if (name) {
    promise = connectionPromises[name];
  } else {
    promise = unnamedConnectionPromise;
  }

  if (promise) {
    return promise;
  } else {
    throw 'No such connection.';
  }
};