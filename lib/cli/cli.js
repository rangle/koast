/* global require */

'use strict';

var q = require('q');
var optimist = require('optimist');
var _ = require('underscore');
var fs = require('fs');

***REMOVED***
var dbUtils = require('../database/db-utils');

var usage = 'Usage: $0 --env [env] <command>';

var connection;

var argv = optimist
  .usage(usage)
  .default ('env', 'local')
  .describe('env', 'The environment to run in.')
  .describe('col', 'Mongo collection to use.')
  .describe('db', 'The database to use.')
  .describe('config', 'Config directory to use.')
  .describe('src', 'The source file.')
  .demand([1])
  .argv;

var handlers = {};

handlers.help = ['Provides help.',
  function () {
    console.log('Available commands:');
    _.keys(handlers).forEach(function (key) {
      console.log('   %s:\t%s', key, handlers[key][0]);
***REMOVED***
  }
];

function demand(keys) {
  if (typeof keys === 'string') {
    keys = [keys];
  }
  keys.forEach(function (key) {
    if (!argv[key]) {
      console.log('Please specify option "%s".', key);
      process.exit();
    }
***REMOVED***
}

function getConnection() {
  if (connection) {
    return q.when(connection);
  } else {
    return dbUtils.createConfiguredConnections()
      .then(function () {
        var handles = dbUtils.getConnectionHandles();
        if (handles.length > 1) {
          demand('db');
***REMOVED***
        connection = dbUtils.getConnectionNow(argv.db || handles[0]);
        return connection;
  ***REMOVED***
  }
}

function getModel() {
  return getConnection()
    .then(function (connection) {
      var model;
      demand('col');
      return connection.model(argv.col);
    })
    .fail(function (error) {
      console.error(error);
      process.exit();
***REMOVED***
}

function exitOnError(error) {
  if (error) {
    console.error(error);
    process.exit();
  }
}

function loadData() {
  var deferred = q.defer();
  return getModel()
    .then(function (model) {
      var data;
      demand('src');
      data = JSON.parse(fs.readFileSync(argv.src).toString());
      model.create(data, function (error, result) {
        exitOnError(error);
        // Now check what we have in the database.
        model.find({}, function (error, result) {
          exitOnError(error);
          deferred.resolve(result.length);
    ***REMOVED***
  ***REMOVED***
      return deferred.promise;
***REMOVED***
}

handlers.load = ['Loads data into the database.',
  function() {
    loadData()
      .then(function(numberOfItems) {
        console.log('Loaded data. We now have %d items in %s.', numberOfItems,
            argv.col);
        process.exit();
***REMOVED***)
      .fail(exitOnError);
  }
];

function dropCollection() {
  var deferred = q.defer();
  return getModel()
    .then(function (model) {
      model.remove({}, function (error, result) {
        exitOnError(error);
        // Now check what we have in the database.
        model.find({}, function (error, result) {
          exitOnError(error);
          deferred.resolve(result.length);
    ***REMOVED***
  ***REMOVED***
      return deferred.promise;
***REMOVED***
}

handlers.drop = ['Drops all data from a mongo collection.',
  function() {
    dropCollection(numberOfItems)
      .then(function() {
        console.log('We now have %d items in %s.', numberOfItems, argv.col);
        process.exit();
***REMOVED***)
      .fail(exitOnError);
  }
];

handlers.reload = ['Drops all data from a mongo collection and reloads from a file',
  function() {
    dropCollection()
      .then(function() {
        return loadData();
***REMOVED***)
      .then(function(numberOfItems) {
        console.log('Reloaded data. We now have %d items in %s.', numberOfItems,
            argv.col);
        process.exit();
***REMOVED***)
      .fail(exitOnError);
  }
];

handlers.dump = ['Dumps all data from a mongo collection to stdio.',
  function () {
    getModel()
      .then(function (model) {
        model.find({}, function (error, result) {
          exitOnError(error);
          // Now check what we have in the database.
          console.log(JSON.stringify(result, null, 2));
          process.exit();
    ***REMOVED***
***REMOVED***)
      .fail(exitOnError);
  }
];

handlers.seed = ['Seeds Koast application from template',
  function() {
    var seedModule = require('./seed');
    seedModule.seed();
  }];

function dispatch() {
  var command = argv._[0];
  var handler = handlers[command] || handlers.help;
  var func = handler[1];
  func();
}

if (argv.config) {
  config.setConfigDirectory(argv.config);
}
config.setEnvironment(argv.env).then(function(){ 
  dispatch();
***REMOVED***
