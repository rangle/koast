/** @module koast/db */
/* jshint expr:true */
/* global require, exports */

'use strict';

var mongoose = require('mongoose');
// mongoose.set('debug', true);
var format = require('util').format;
var async = require('async');
var assert = require('assert');
var Q = require('q');
var _ = require('underscore');

***REMOVED***
var util = require('../util/util');

var connections = {};
var connectionPromises = {};

// Creates a mongoDb URL based on a config object.
function makeMongoUrl(dbConfig) {
  var userpass = '';
  if (dbConfig.pass) {
    userpass = dbConfig.user + ':' + dbConfig.pass + '@';
  }
  return format('mongodb://%s%s:%d/%s', userpass, dbConfig.host, dbConfig.port,
    dbConfig.db);
}

// Creates a single mongoose model with indices based on an object that defines
// a schema. A callback is called when the model is fully setup.
function createModel(connection, schema, callback) {
  var mongooseSchema;
  var model;
  var indices = schema.indices || [];

  // Convert our proto-schema into an actual mongoose schema object. This
  // part is easy and is done synchronously.
  mongooseSchema = new mongoose.Schema(schema.properties, {
    collection: schema.name
***REMOVED***

  // Setup schema-level indices. This just defines then, however.
  indices.forEach(function (index) {
    mongooseSchema.index(index[0], index[1]);
***REMOVED***

  // Create the model. This is still synchronous.
  model = connection.model(schema.name, mongooseSchema);
  // model.on('index', function (err) {
  //   if (err) {
  //     // Do something about error during index creation
  //   }
  // ***REMOVED***

  // Now we need to actually create the indices. This needs to be done
  // asynchronously.
  model.ensureIndexes(function (error) {
    if (error) {
      callback(error);
    } else {
      callback();
    }
***REMOVED***
}

// Creates a mongoose connection based on a config object and a schema object,
// returning a promise that resolves to the setup connection.
function createConnection(handle, dbConfig, schemas) {

  var deferred = Q.defer();
  var connection;

  // Create a connection.
  connection = mongoose.createConnection(makeMongoUrl(dbConfig));
  connections[handle] = connection;

  // If we catch an error, reject the promise if it's not too late to do so.
  connection.on('error', function (error) {
    if (deferred.promise.isPending()) {
      deferred.reject(error);
    }
***REMOVED***

  // Let's go through the schemas for each collection and generate a setup task
  // for each. We'll need to run those tasks asynchronously because
  // ensureIndexes is asynchronous.
  var schemaTasks = _.map(schemas, function (schema) {
    return function (callback) {
      createModel(connection, schema, callback);
***REMOVED***
***REMOVED***

  // Now we use async.series to process each schema in sequence and resolve the
  // promise when we are done, assuming hasn't gotten rejected by then.
  async.series(schemaTasks, function (error) {
    if (deferred.promise.isPending()) {
      if (error) {
        deferred.reject(error);
***REMOVED*** else {
        deferred.resolve(connection);
***REMOVED***
    }
***REMOVED***

  return deferred.promise;
}

/**
 * Creates a single database connection based on a database config object and
 * schema configurations, returning a promise that resolves when the connection
 * is fully setup.
 *
 * @param  {String}   handle       A handle for the connection.
 * @param  {Object}   dbConfig     A database configuration object.
 * @param  {Array}    schemas      An array of schema definitions.
 * @return {promise}               A promise that resolves to a connection.
 */
exports.createSingleConnection = function (handle, dbConfig, schemas) {
  assert(handle, 'Connection handle is undefined.');
  assert(_.isObject(dbConfig),
    'Database configuration object is undefined or not an object.');
  assert(_.isArray(schemas),
    'Schemas array is undefined or not an array.');
  assert(_.isUndefined(connectionPromises[handle]),
    'A connection with this handle is already defined.');
  connectionPromises[handle] = createConnection(handle, dbConfig, schemas);
  return connectionPromises[handle];
};

/**
 * Creates connections defined in the "databases" configuration.
 *
 * @function createConfiguredConnections
 * @param  {Array}    subset       A list of keys specifying which databases to
 *                                 load. (Optional, defaults to all.)
 * @param  {Function} callback     A callback function called after every
 *                                 connection. (Optional.)
 * @return {promise}               A Q promise that resolves to an array of
 *                                 ready connections.
 */
exports.createConfiguredConnections = function (subset, callback) {
  var databases = config.getConfig('databases');

  // If subset is specified, filter the databases accordingly.
  if (subset && subset.length > 0) {
    databases = _.filter(databases, function (database) {
      return _.contains(subset, database.handle);
***REMOVED***
  }
  return Q.all(_.map(databases, function (database, index) {
    var schemas;
    var handle;
    index = parseInt(index);
    // We want each database connection to have a key.
    if (index === 0) {
      handle = database.handle || '_';
    } else {
      assert(database.handle,
        'Each database config after the first needs to specify a handle.');
      handle = database.handle;
    }
    // Load the schema by requiring the specified module.
    schemas = util.requireRelative(database.schemas).schemas;
    assert(_.isArray(schemas), 'Schemas should be an array.');
    return exports.createSingleConnection(handle, database, schemas,
      callback);
  }));
};

/**
 * Provides the list of handles for available database connections.
 *
 * @function getConnectionHandles
 * @return {Array}                 An array of strings representing connecition
 *                                 handles.
 */
exports.getConnectionHandles = function () {
  return _.keys(connectionPromises);
};

/**
 * Returns a connection for a given handle. The connection is returned
 * immediately, whether or not it is ready.
 *
 * @function getConnectionNow
 * @param  {String} handle         A connection handle.
 * @return {Object}                A mongoose connection object.
 */
exports.getConnectionNow = function (handle) {
  handle = handle || '_';
  var connection = connections[handle];
  if (connection) {
    return connection;
  } else {
    throw new Error('No such connection: ' + handle);
  }
};

/**
 * Closes all connections immediately (without waiting for them to be
 * finalized). Returns a promise that resolves when this is done.
 *
 * @return {promise}               A promise that resolves when all connections
 *                                 have been closed.
 */
exports.closeAllConnectionsNow = function () {
  return Q.all(_.map(connections, function (connection) {
    return Q.ninvoke(connection, 'close');
  }));
};

/**
 * Returns a promise for a connection identified by a handle. The promise will
 * resolve to a connection when the connection is ready.
 *
 * @function getConnectionPromise
 * @param  {String} handle         A connection handle.
 * @return {Object}                A promise that resolves to a mongoose
 *                                 connection object.
 */
exports.getConnectionPromise = function (handle) {
  handle = handle || '_';
  var promise = connectionPromises[handle];
  if (promise) {
    return promise;
  } else {
    throw 'No such connection: ' + handle;
  }
};

/**
 * Wipe out the state. This should probably only used for testing.
 *
 * @return {undefined}             Nothing is returned.
 */
exports.reset = function () {
  connections = {};
  connectionPromises = {};
};
