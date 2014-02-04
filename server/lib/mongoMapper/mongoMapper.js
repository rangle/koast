'use strict';

//var log = require('../log');

var errorHandler = function (req, res, error) {
  //log.error(error.toString());
  res.send(500, 'Oops');
};

exports.setErrorHandler = function (newErrorHandler) {
  errorHandler = newErrorHandler;
};

exports.makeGetter = function (dbConnection, modelName, queryFields) {
  var model = dbConnection.model(modelName);
  queryFields = queryFields || [];

  return function (req, res) {
    var query = {};
    queryFields.forEach(function (fieldName) {
      query[fieldName] = req.query[fieldName];
***REMOVED***
    model.find(query).exec()
      .then(function (results) {
        res.send(200, results);
***REMOVED***)
      .onReject(function (error) {
        throw 'Database problem';
  ***REMOVED***
  };
};