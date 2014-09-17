/* global require, describe, it, before, after */
/* jshint expr:true */

'use strict';
***REMOVED***
var Q = require('q');

***REMOVED***
var dbUtils = require('./db-utils');

var schemas = [{
  name: 'robots',
  properties: {
    robotNumber: {
      type: Number,
      required: true,
      unique: true
    },
    robotName: {
      type: String
    }
  }
}, {
  name: 'babyRobots',
  properties: {
    parentNumber: {
      type: Number,
      required: true
    },
    babyNumber: {
      type: Number,
      required: true
    }, // unique among siblings
    babyRobotName: {
      type: String
    }
  },
  indices: [
    [{
      parentNumber: 1,
      babyNumber: 1
    }, {
      unique: true
    }]
  ]
}];

function testConnection(connection, name) {
  expect(connection.port).to.equal(27017);
  expect(connection.name).to.equal(name);
}

function testConnectionPromise(promise, name, done) {
  expect(Q.isPromise(promise)).to.be.true;
  promise
    .then(function(connection) {
      expect(connection.port).to.equal(27017);
      expect(connection.name).to.equal(name);
      done();
    })
    .fail(done);
}

describe('Testing connection.', function (done) {
  var connectionPromise;
  var connection;

***REMOVED***
    config.setConfigDirectory('test-data/config/', {force: true***REMOVED***
    config.setEnvironment('test', {force: true***REMOVED***
    dbUtils.reset();
***REMOVED***

  after(function() {
    return dbUtils.closeAllConnectionsNow();
***REMOVED***

  it('Create configured connections', function (done) {
    connectionPromise = dbUtils.createConfiguredConnections();
    expect(Q.isPromise(connectionPromise)).to.be.true;
    connectionPromise
      .then(function (connections) {
        expect(connections).to.be.an.array;
        expect(connections.length).to.equal(2);
        testConnection(connections[0], 'koast1');
        done();
***REMOVED***)
      .fail(done);
***REMOVED***
  it('Get one of the connections', function (done) {
    var promise = dbUtils.getConnectionPromise('db2');
    testConnectionPromise(promise, 'koast2', done);
***REMOVED***
  it('Create another connection', function (done) {
    var promise = dbUtils.createSingleConnection('another',
      config.getConfig('anotherDb'),
      schemas);
    testConnectionPromise(promise, 'koast3', done);
***REMOVED***
  it('Get the same connection from the module', function (done) {
    var promise = dbUtils.getConnectionPromise('another');
    testConnectionPromise(promise, 'koast3', done);
***REMOVED***
  it('Check the number of connections', function () {
    var handles = dbUtils.getConnectionHandles();
    expect(handles.length).to.equal(3);
***REMOVED***
  it('Close all connections.', function (done) {
    dbUtils.closeAllConnectionsNow()
      .then(function() {
        done();
***REMOVED***)
      .fail(done);
***REMOVED***
  it('Create an unnamed connection.', function (done) {
    var promise = dbUtils.createSingleConnection('_',
      config.getConfig('anotherDb'),
      schemas);
    testConnectionPromise(promise, 'koast3', done);
***REMOVED***
  it('Get the connection without a name', function (done) {
    var promise = dbUtils.getConnectionPromise();
    testConnectionPromise(promise, 'koast3', done);
***REMOVED***
  it('Get the connection without a promise.', function () {
    var promise = dbUtils.getConnectionNow('_');
    testConnection(promise, 'koast3');
***REMOVED***
  it('Remove old robots', function (done) {
    connection = dbUtils.getConnectionNow();
    connection.model('robots').remove({}, function (error, result) {
      expect(error).to.not.exist;
      done();
***REMOVED***
***REMOVED***
  it('Insert a robot', function (done) {
    connection.model('robots').create({
        robotNumber: 1
***REMOVED*** function (error, result) {
        expect(error).to.not.exist;
        done();
  ***REMOVED***
***REMOVED***
  it('Insert the same robot again', function (done) {
    connection.model('robots').create({
      robotNumber: 1
    }, function (error, result) {
      expect(error).to.exist;
      done();
***REMOVED***
***REMOVED***
  it('Insert robot #2', function (done) {
    connection.model('robots').create({
      robotNumber: 2
    }, function (error, result) {
      expect(error).to.not.exist;
      done();
***REMOVED***
***REMOVED***
  it('Remove old baby robots', function (done) {
    connection.model('babyRobots').remove({}, function (error, result) {
      expect(error).to.not.exist;
      done();
***REMOVED***
***REMOVED***
  it('Insert baby robot 1 (son of 1)', function (done) {
    connection.model('babyRobots').create({
      parentNumber: 1,
      babyNumber: 1
    }, function (error, result) {
      expect(error).to.not.exist;
      done();
***REMOVED***
***REMOVED***
  it('Insert baby robot 2 (son of 1)', function (done) {
    connection.model('babyRobots').create({
      parentNumber: 1,
      babyNumber: 2
    }, function (error, result) {
      expect(error).to.not.exist;
      done();
***REMOVED***
***REMOVED***
  it('Insert baby robot 2 (son of 1) again', function (done) {
    connection.model('babyRobots').create({
      parentNumber: 1,
      babyNumber: 2
    }, function (error, result) {
      expect(error).to.exist;
      done();
***REMOVED***
***REMOVED***
***REMOVED***
