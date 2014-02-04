/* global require, describe, it, console */

'use strict';

***REMOVED***

var koast = require('../index');
koast.setConfigDirectory('test/index_config/');
koast.setEnvironment('test');

describe('Basic app setup.', function () {
  var appConfig = koast.getConfig('app');
  var dbConfig = koast.getConfig('database');
  var schemas = [{
    name: 'robots',
    properties: {
      robotNumber: {
        type: Number,
        required: true,
        unique: true
***REMOVED***
      robotName: {
        type: String
***REMOVED***
    }
  }, {
    name: 'babyRobots',
    properties: {
      parentNumber: {
        type: Number,
        required: true
***REMOVED***
      babyNumber: {
        type: Number,
        required: true
***REMOVED*** // unique among siblings
      babyRobotName: {
        type: String
***REMOVED***
    },
    indices: [
      [{
        parentNumber: 1,
        babyNumber: 1
***REMOVED*** {
        unique: true
***REMOVED***]
    ]
  }];

  it('Initialize a db connection.', function(done) {
    koast.createNamedDatabaseConnection('maindb', dbConfig, schemas)
      .then(function (connection) {
        console.log('Resolved the connection');
        expect(connection).to.not.be.undefined;
        console.log('Good');
        done();
  ***REMOVED***
***REMOVED***

  it('Make an app', function() {
    var app = koast.makeExpressApp(appConfig);
    expect(app).to.not.be.undefined;
***REMOVED***

***REMOVED***