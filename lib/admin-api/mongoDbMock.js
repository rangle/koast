'use strict';
/* global require, console */
var R = require('ramda');

function MongoClient() {
  this.connect = MongoClient.connect;
}

MongoClient.connect = function(connectionString, callback) {
  callback(null, DbFactory.getDb());
};

MongoClient.getDb = function() {
  return DbFactory.getDb();
};

var DbFactory = (function() {
  var db = null;
  function createInstance() {
    return new Db();
  }

  return {
    getDb: function() {
      if (db === null) {
        db = createInstance();
      }
      return db;
    }
  };
})();

/**
 *
 * @param [databaseName]
 * @param [serverConfig]
 * @param [options]
 * @returns {
 *   {
 *     collection: collection,
 *     registerCollection: registerCollection
 *   }
 * }
 * @constructor
 */
function Db(databaseName, serverConfig, options) {
  var self = {};
  var dbName = databaseName || '';
  var config = serverConfig || null;
  options = options || {};
  var collections = {};
  var error = null;

  var setError = function(message, code) {
    error = new MongoError(message, code);
  };

  var clearError = function() {
    error = null;
  };

  /**
   *
   * @param collectionName Returns a collection from the database
   * @param [options]
   * @param [callback] if supplied, the callback will be called with the collection
   */
  var collection = function(collectionName, options, callback) {
    var args = Array.prototype.splice.call(arguments, 0);
    callback = callback || args.pop();
    var foundCollection = collections[collectionName] || new Collection(collectionName);
    if (callback === undefined || typeof callback !== 'function') {
      if(error !== null) {
        return error;
      }
      return foundCollection;
    }
    if(error !== null) {
      callback(error, null);
    } else {
      callback(null, foundCollection);
    }
  };

  var registerCollection = function(collectionName, dataArray) {
    collections[collectionName] = new Collection(collectionName,
      dataArray);
  };

  return {
    collection: collection,
    registerCollection: registerCollection,
    collections: collections,
    setError: setError,
    clearError: clearError
  };
}

function Collection(collectionName, dataArray) {
  //TODO: add validation on dataArray
  var name = collectionName || '';
  var data = dataArray || [];
  var error = null;

  var insert = function(record) {
    var args = Array.prototype.slice.call(arguments, 0);
    var callback = args.pop();

    data.push(record);
    if(error !== null) {
      callback(error, null);
    } else {
      callback(null, true);
    }
  };
  /**
   * Various argument possibilities @see http://mongodb.github.io/node-mongodb-native/api-generated/collection.html
   * callback?
   * selector, callback?,
   * selector, fields, callback?
   * selector, options, callback?
   * selector, fields, options, callback?
   * selector, fields, skip, limit, callback?
   * selector, fields, skip, limit, timeout, callback?
   * NOTE: Not all of these parameters are supported.
   *
   * For now this will just return all the data in the collection.
   * @param query
   * @param returnProperties
   * @param callback
   */
  var find = function(selector, options, callback) {
    var args = Array.prototype.splice.call(arguments, 0);
    callback = callback || args.pop();
    if(callback === undefined || typeof callback !== 'function') {
      if (error !== null) {
        return error;
      } else {
        return new Cursor(data);
      }
    }
    callback(null, new Cursor(data));
  };

  var findOne = function(selector, options, callback) {
    var args = Array.prototype.slice.call(arguments, 0);
    callback = callback || args.pop();
    var dataFound = R.filter(function(val) {
      if(R.where(selector, val) === true) {
        return val;
      }
    }, data);

    if (callback) {
      if (error !== null) {
        callback(error, null);
      } else {
        callback(null, new Cursor([dataFound[0]]));
      }
    } else {
      return dataFound.length !== 0;
    }
  };

  var setError = function(message, code) {
    error = new MongoError(message, code);
  };

  var clearError = function() {
    error = null;
  };

  return {
    clearError: clearError,
    data: data,
    find: find,
    findOne: findOne,
    insert: insert,
    setError: setError
  };
}

function Cursor (data) {
  this.data = data || [];
  this.index = 0;
  var self = this;

  this.toArray = function(callback) {
    callback(null, data.splice(self.index));
  };
}

function MongoError (message, code) {
  var maxConnId = 20000;
  var minConnId = 10000;
  this.name = 'MongoError';
  this.err = message;
  this.code = code;
  this.n = 0;
  this.connectionId = Math.floor(Math.random() * (maxConnId - minConnId) + minConnId);
  this.ok = 1;
}

MongoError.prototype = Error.prototype;

exports.MongoClient = MongoClient;