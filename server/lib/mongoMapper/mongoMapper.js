/* global require, exports */

'use strict';

/**
 * This module maps connect requests to mongo queries.
 */

var _ = require('underscore');
var log = require('../log');

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
  _.keys(req.params).forEach(function (param) {
    query[param] = req.params[param];
***REMOVED***

  // Constrain the query by each required query field. Throw an error if the
  // value is not supplied.
  requiredQueryFields = requiredQueryFields || [];
  requiredQueryFields.forEach(function (fieldName) {
    if (!req.query[fieldName]) {
      throw new Error('Missing required field: ' + fieldName);
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
function makeResultHandler(request, response, filter, authorizer, options) {
  options = options || {};
  return function (error, results) {
    if (error) {
      log.error(error);
      response.send(500, 'Database error: ', error.toString());
    } else {

      if (options.postLoadProcessor) {
        results = options.postLoadProcessor(results, response);
***REMOVED***

      response.setHeader('Content-Type', 'text/plain');
      if (!_.isArray(results)) {
        results = [results];
***REMOVED***
      results = _.filter(results, function(result) {
        return filter(result, request);
  ***REMOVED***

      results = _.map(results, function (result) {
        result = {
          meta: {
            can: {}
    ***REMOVED***
          data: result
***REMOVED***;
        authorizer(result, request, response);
        return result;
  ***REMOVED***
      response.send(200, results);
    }
  };
}

// Makes a getter function.
handlerFactories.get = function (model, queryDecorator, filter, authorizer, moreArgs) {
  var requiredQueryFields = moreArgs[0];
  var optionalQueryFields = moreArgs[1];
  return function (req, res) {
    var query = prepareQuery(req, requiredQueryFields, optionalQueryFields);
    queryDecorator(query, req, res);
    model.find(query).lean().exec(makeResultHandler(req, res, filter, authorizer));
  };
};

// Makes an updater function.
handlerFactories.put = function (model, queryDecorator, filter, authorizer) {
  return function (req, res) {
    var query = prepareQuery(req);
    queryDecorator(query, req, res);
    model.findOne(query, function (err, object) {

      if (!object) {
        return res.send(404, 'Resource not found.');
***REMOVED*** else if (!filter(object, req)) {
        return res.send(401, 'Not allowed to PUT.');
***REMOVED***

      _.keys(req.body).forEach(function (key) {
        if (key !== '_id' && key !== '__v') {
          object[key] = req.body[key];
***REMOVED***
  ***REMOVED***
      // We are using object.save() rather than findOneAndUpdate to ensure that
      // pre middleware is triggered.
      object.save(makeResultHandler(req, res, filter, authorizer));
***REMOVED***
  };
};

// Makes an poster function.
handlerFactories.post = function (model, queryDecorator, filter, authorizer) {
  return function (req, res) {
    var object = model(req.body);
    if (!filter(object, req)) {
      return res.send(401, 'Not allowed to POST.');
    }
    if (!object) {
      return res.send(500, 'Failed to create an object.');
    }
    object.save(makeResultHandler(req, res, filter, authorizer));
  };
};

// Makes an deleter function.
handlerFactories.del = function (model, queryDecorator, filter, authorizer) {
  return function (req, res) {
    var query = prepareQuery(req);
    queryDecorator(query, req, res);
    model.remove(query, makeResultHandler(req, res, filter, authorizer));
  };
};

/**
 * Creates a set of factories, which can then be used to create request
 * handlers.
 *
 * @param  {Object} dbConnection   A mongoose database connection.
 * @return {Object}                An object offering handler factory methods.
 */
exports.makeMapper = function (dbConnection) {
  var service = {};
  service.queryDecorator = function () {}; // The default is to do nothing.
  service.filter = function() {
    // The default is to allow everything.
    return true;
  };
  service.authorizer = function () {}; // The default is to do nothing.

  ['get', 'post', 'put', 'del'].forEach(function (method) {
    service[method] = function (modelName) {
      var model = dbConnection.model(modelName);
      var makeHandler = handlerFactories[method];
      return makeHandler(model, service.queryDecorator, service.filter, service.authorizer,
        Array.prototype.slice.apply(arguments).slice(1));
***REMOVED***
***REMOVED***

  return service;
};
