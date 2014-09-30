/** @module koast/mongoMapper */
/* global require, exports */

'use strict';

//
// This module maps connect requests to mongo queries.


var _ = require('underscore');
var log = require('../log');
var dbUtils = require('../database/db-utils');

var handlerFactories = {};

var errorHandler = function (req, res, error) {
  //log.error(error.toString());
  res.status(500).send('Ooops')

};

/**
 * Sets an alternative error handler function.
 *
 * @param {Function} newHandler    The new error handler function.
 */
exports.setErrorHandler = function (newHandler) {
  errorHandler = newHandler;
};

function prepareQuery(req, options) {
  var query = {};
  // Constrain the query by each param.
  _.keys(req.params).forEach(function (param) {
    query[param] = req.params[param];
***REMOVED***

  // Constrain the query by each required query field. Throw an error if the
  // value is not supplied.
  if (options.requiredQueryFields) {
    options.requiredQueryFields.forEach(function (fieldName) {
      if (!req.query[fieldName]) {
        throw new Error('Missing required field: ' + fieldName);
***REMOVED***
      query[fieldName] = req.query[fieldName];
***REMOVED***
  }

  // Constrain the query by each optional query field. Skip those for which
  // we got no value.
  if (options.optionalQueryFields) {
    options.optionalQueryFields.forEach(function (fieldName) {
      if (req.query[fieldName]) {
        query[fieldName] = req.query[fieldName];
***REMOVED***
***REMOVED***
  }

  return query;
}

// Makes a result handler for mongo queries.
function makeResultHandler(request, response, options) {
  return function (error, results) {
    if (error) {
      log.error(error);
      response.status(500).send('Database error: ', error.toString());
    } else {
      if (options.postLoadProcessor) {
        results = options.postLoadProcessor(results, response);
***REMOVED***

      response.setHeader('Content-Type', 'text/plain');
      if (!_.isObject(results)) {
        // Do not wrap non-object results.
        response.status(200).send((results || '').toString());
        return;
***REMOVED***

      if (!_.isArray(results)) {
        results = [results];
***REMOVED***
      results = _.filter(results, function (result) {
        return options.filter(result, request);
  ***REMOVED***

      if (options.useEnvelope) {
        results = _.map(results, function (result) {
          result = {
            meta: {
              can: {}
      ***REMOVED***
            data: result
  ***REMOVED***;
          options.annotator(request, result, response);
          return result;
    ***REMOVED***
***REMOVED***

      response.status(200).send(results);
    }
  };
}

// Makes a getter function.
handlerFactories.get = function (options) {
  return function (req, res) {
    var query = prepareQuery(req, options);
    options.queryDecorator(query, req, res);
    options.actualModel.find(query).lean().exec(makeResultHandler(req, res,
      options));
  };
};

// Makes an updater function.
handlerFactories.put = function (options) {
  return function (req, res) {
    var query = prepareQuery(req, options);
    options.queryDecorator(query, req, res);
    options.actualModel.findOne(query, function (err, object) {

      if (!object) {
        return res.status(404).send('Resource not found.');
***REMOVED*** else if (!options.filter(object, req)) {
        return res.status(401).send('Not allowed to PUT.');
***REMOVED***

      _.keys(req.body).forEach(function (key) {
        if (key !== '_id' && key !== '__v') {
          object[key] = req.body[key];
***REMOVED***
  ***REMOVED***
      // We are using object.save() rather than findOneAndUpdate to ensure that
      // pre middleware is triggered.
      object.save(makeResultHandler(req, res, options));
***REMOVED***
  };
};

// Makes an poster function.
handlerFactories.post = function (options) {
  return function (req, res) {
    var object = options.actualModel(req.body);
    if (!options.filter(object, req)) {
      return res.status(401).send('Not allowed to POST.');
    }
    if (!object) {
      return res.status(500).send('Failed to create an object.');
    }
    object.save(makeResultHandler(req, res, options));
  };
};

// Makes an deleter function.
handlerFactories.del = function (options) {
  return function (req, res) {
    var query = prepareQuery(req, options);
    options.queryDecorator(query, req, res);
    options.actualModel.remove(query, makeResultHandler(req, res, options));
  };
};

/*
// Makes a handler factory that will later create a handler based on provided
// configurations. This is to allow us to configure several methods for the
// same endpoint.
handlerFactories.auto = function (options) {
  // We'll be returning a function that will take an endpoint configuration.
  // When this function is called and provided with the config, we'll look
  // into this config to figure out which handler factory to use and call it
  // with the original options.
  var factoryFunction = function (config) {
    var method = config.method;
    return handlerFactories[method](options);
  };
  factoryFunction.isMiddlewareFactory = true;
  return factoryFunction;
};
*/

/**
 * Creates a set of factories, which can then be used to create request
 * handlers.<br />
 * <b><em>TODO: document get, put, post, del</em></b>
 *
 * @param  {Object} dbConnection   A mongoose database connection (ot)
 * @return {Object}                An object offering handler factory methods.
 */
exports.makeMapper = function (dbConnection) {
  var service = {};

  dbConnection = dbConnection || dbUtils.getConnectionNow();

  service.options = {
    useEnvelope: true
  };
  service.options.queryDecorator = function () {}; // The default is to do nothing.
  service.options.filter = function () {
    // The default is to allow everything.
    return true;
  };
  service.options.annotator = function () {}; // The default is to do nothing.

  ['get', 'post', 'put', 'del'].forEach(function (method) {
    service[method] = function (arg) {
      var model;
      var handlerFactory;
      var options = {};
      var optionsSpecificToRoute;

      if (typeof arg === 'string') {
        optionsSpecificToRoute = {
          model: arg
***REMOVED***;
***REMOVED*** else {
        optionsSpecificToRoute = arg;
***REMOVED***

      options = _.extend(options, service.options);
      options = _.extend(options, optionsSpecificToRoute);
      options.actualModel = dbConnection.model(options.model);
      handlerFactory = handlerFactories[method];

      return handlerFactory(options);
***REMOVED***
***REMOVED***

  return service;
};
