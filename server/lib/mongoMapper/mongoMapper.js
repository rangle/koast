'use strict';

var _ = require('underscore');

//var log = require('../log');

var errorHandler = function (req, res, error) {
  //log.error(error.toString());
  res.send(500, 'Oops');
};

exports.setErrorHandler = function (newErrorHandler) {
  errorHandler = newErrorHandler;
};

function makeGetter (model, queryFields) {
  queryFields = queryFields || [];
  return function (req, res) {
    var query = {};
    _.keys(req.params).forEach(function(param) {
      query[param] = req.params[param];
***REMOVED***
    queryFields.forEach(function (fieldName) {
      query[fieldName] = req.query[fieldName];
***REMOVED***
    model.find(query).exec()
      .then(function (results) {
        res.send(200, results);
***REMOVED***)
      .onReject(function (error) {
        throw 'Database problem: ' + error;
  ***REMOVED***
  };
};

exports.makeMongoMapper = function(dbConnection) {
  var service = {};
  service.get = function(modelName, paramFields, queryFields) {
    var model = dbConnection.model(modelName);
    return makeGetter(model, queryFields);
  };
  return service;
}