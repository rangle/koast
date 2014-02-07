'use strict';

/**
 * This module maps connect requests to mongo queries.
 */

var _ = require('underscore');
var assert = require('assert');
//var log = require('../log');

var handlerFactories = {};

var errorHandler = function (req, res, error) {
  //log.error(error.toString());
  res.send(500, 'Oops');
};

/**
 * Sets an alternative error handler function.
 *
 * @param {Function} newHandler    The new error handler function.
 */
exports.setErrorHandler = function (newHandler) {
  errorHandler = newHandler;
};

function prepareQuery(req, requiredQueryFields, optionalQueryFields) {
  var query = {};
  // Constrain the query by each param.
  _.keys(req.params).forEach(function(param) {
    query[param] = req.params[param];
***REMOVED***

  // Constrain the query by each required query field. Throw an error if the
  // value is not supplied.
  requiredQueryFields = requiredQueryFields || [];
  requiredQueryFields.forEach(function (fieldName) {
    if (!req.query[fieldName]) {
      throw Error('Missing required field: ' + fieldName);
    }
    query[fieldName] = req.query[fieldName];
***REMOVED***

  // Constrain the query by each optional query field. Skip those for which
  // we got no value.
  optionalQueryFields = optionalQueryFields || [];
  optionalQueryFields.forEach(function (fieldName) {
    if (req.query[fieldName]) {
      query[fieldName] = req.query[fieldName];
    }
***REMOVED***
  return query;
}

// Makes a result handler for mongo queries.
function makeResultHandler (response, options) {
  options = options || {};
  return function (error, result) {
    if (error) {
      throw error;
    } else {
      if (options.postLoadProcessor) {
        result = options.postLoadProcessor(result, response);
***REMOVED***
      response.setHeader('Content-Type', 'text/plain');
      if (typeof result === 'number') {
        // Make sure result is not a number, otherwise express will set the
        // status to that number.
        result = result.toString();
***REMOVED***
      response.send(200, result);
    }
  };
}

// Makes a getter function.
handlerFactories.get = function (model, moreArgs) {
  var requiredQueryFields = moreArgs[0];
  var optionalQueryFields = moreArgs[1];
  return function (req, res) {
    var query = prepareQuery(req, requiredQueryFields, optionalQueryFields);
    model.find(query, makeResultHandler(res));
  };
};

// Makes an updater function.
handlerFactories.put = function (model) {
  return function (req, res) {
    var query = prepareQuery(req);
    model.findOne(query, function(err, object) {
      _.keys(req.body).forEach(function(key) {
        object[key] = req.body[key];
  ***REMOVED***
      // We are using object.save() rather than findOneAndUpdate to ensure that
      // pre middleware is triggered.
      object.save(makeResultHandler(res));
***REMOVED***
  };
}

// Makes an poster function.
handlerFactories.post = function(model) {
  return function (req, res) {
    var object = model(req.body);
    assert(object, 'Failed to create an object.');
    object.save(makeResultHandler(res));
  };
}

// Makes an deleter function.
handlerFactories.del = function (model) {
  return function (req, res) {
    var query = prepareQuery(req);
    model.remove(query, makeResultHandler(res));
  };
}

/**
 * Creates a set of factories, which can then be used to create request
 * handlers.
 *
 * @param  {Object} dbConnection   A mongoose database connection.
 * @return {Object}                An object offering handler factory methods.
 */
exports.makeMapper = function(dbConnection) {
  var service = {};

  ['get', 'post', 'put', 'del'].forEach(function(method) {
    service[method] = function(modelName) {
      var model = dbConnection.model(modelName);
      var makeHandler = handlerFactories[method];
      return makeHandler(model, Array.prototype.slice.apply(arguments).slice(1));
    }
***REMOVED***

  return service;
};