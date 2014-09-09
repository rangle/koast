/* global require, describe, it, before, after */
/* jshint expr:true */

'use strict';
***REMOVED***
var Q = require('q');
var _ = require('underscore');
***REMOVED***
var dbUtils = require('../database/db-utils');
var mongoMapper = require('../mongo-mapper/mongo-mapper');

describe('mongoMapper', function () {
  var mapper;
  var connection;
  var robotGetter;
  var robotListGetter;
  var robotPoster;
  var robotUpdater;
  var robotDeleter;
  var robotId;
  var postedRobotId;

***REMOVED***
    config.setConfigDirectory('server/test-data/config/', {force: true***REMOVED***
    config.setEnvironment('test', {force: true***REMOVED***
    dbUtils.reset();
***REMOVED***

  after(function() {
    return dbUtils.closeAllConnectionsNow();
***REMOVED***

  it('should have a connection', function (done) {
    var connectionPromise = dbUtils.createConfiguredConnections(['db1']);
    expect(Q.isPromise(connectionPromise)).to.be.true;
    connectionPromise
      .then(function (connections) {
        expect(connections).to.be.an.array;
        expect(connections.length).to.equal(1);
        connection = connections[0];
        done();
***REMOVED***)
      .fail(done);
***REMOVED***

  it('should initialize', function () {
    mapper = mongoMapper.makeMapper(connection);
    expect(mapper).to.not.be.undefined;
    expect(mapper).to.have.property('get');
***REMOVED***

  it('Remove old robots', function (done) {
    connection.model('robots').remove({}, function (error, result) {
      expect(error).to.not.exist;
      done();
***REMOVED***
***REMOVED***

  it('Insert a robot', function (done) {
    connection.model('robots').create({
      robotNumber: 1
    }, function (error, result) {
      expect(error).to.not.exist;
      robotId = result._id;
      done();
***REMOVED***
***REMOVED***

  function makeResponseTester(expectedStatus, done, test) {
    return {
      setHeader: function() {},
      send: function (status, data) {
        expect(status).to.equal(expectedStatus);
        if (test) {
          test(data);
***REMOVED***
        done();
***REMOVED***
***REMOVED***
  }

  function makeRequest(config) {
    var request = _.clone(config || {***REMOVED***
    request.params = request.params || {};
    return request;
  }

  it('Create a get handler and get a robot we have', function (done) {
    robotGetter = mapper.get({
      model: 'robots'
***REMOVED***
    robotGetter(makeRequest({
      params: {
        _id: robotId
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(1);
      expect(result[0].data.robotNumber).to.equal(1);
    }));
***REMOVED***

  it('Get a robot we do not have', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: '52f1b16197df290000930544'
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(0);
    }));
***REMOVED***

  it('Create a list getter and get all robots.', function (done) {
    robotListGetter = mapper.get({
      model: 'robots'
***REMOVED***
    robotListGetter(makeRequest(), makeResponseTester(200, done, function (
      result) {
      expect(result.length).to.equal(1);
    }));
***REMOVED***

  it('Create a poster and post a new robot.', function (done) {
    robotPoster = mapper.post({
      model: 'robots'
***REMOVED***
    robotPoster(makeRequest({body: {
      robotNumber: 2
    }}), makeResponseTester(200, done, function (result) {
      postedRobotId = result[0].data._id;
    }));
***REMOVED***

  it('Get the posted robot.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(2);
    }));
***REMOVED***

  it('Create an updater and update the posted robot.', function (done) {
    robotUpdater = mapper.put({
      model: 'robots'
***REMOVED***
    robotUpdater(makeRequest({
      params: {
        _id: postedRobotId
***REMOVED***
      body: {
        robotNumber: 3
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(3);
    }));
***REMOVED***

  it('Get the updated robot.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(3);
    }));
***REMOVED***

  it('Delete the updated robot.', function (done) {
    robotDeleter = mapper.del({
      model: 'robots'
***REMOVED***
    robotDeleter(makeRequest({
      params: {
        _id: postedRobotId
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result).to.equal('1');
    }));
***REMOVED***

  it('Check that the deleted robot is gone.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
***REMOVED***
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(0);
    }));
***REMOVED***
***REMOVED***