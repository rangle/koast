/* global require, describe, it, before, after */
/* jshint expr:true */

'use strict';
var expect = require('chai').expect;
var Q = require('q');
var _ = require('underscore');
var config = require('../config');
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

  before(function () {

    /*config.setConfigDirectory('test-data/config/', {
      force: true
    });*/
    return config.loadConfiguration('test', {
      force: true
    }).then(function () {
      dbUtils.reset();
      return;
    });

  });

  after(function () {
    return dbUtils.closeAllConnectionsNow();
  });

  it('should have a connection', function (done) {
    var connectionPromise = dbUtils.createConfiguredConnections(['db1']);
    expect(Q.isPromise(connectionPromise)).to.be.true;
    connectionPromise
      .then(function (connections) {
        expect(connections).to.be.an.array;
        expect(connections.length).to.equal(1);
        connection = connections[0];
        done();
      })
      .fail(done);
  });

  it('should initialize', function () {
    mapper = mongoMapper.makeMapper(connection);
    expect(mapper).to.not.be.undefined;
    expect(mapper).to.have.property('get');
  });

  it('Remove old robots', function (done) {
    connection.model('robots').remove({}, function (error, result) {
      expect(error).to.not.exist;
      done();
    });
  });

  it('Insert a robot', function (done) {
    connection.model('robots').create({
      robotNumber: 1
    }, function (error, result) {
      expect(error).to.not.exist;
      robotId = result._id;
      done();
    });
  });

  function makeResponseTester(expectedStatus, done, test) {
    return {
      setHeader: function () {},
      status: function (status) {

        expect(status).to.equal(expectedStatus);
        return this;
      },
      send: function (data) {

        if (test) {
          test(data);
        }
        done();
      }
    };
  }

  function makeRequest(config) {
    var request = _.clone(config || {});
    request.params = request.params || {};
    return request;
  }

  it('Create a get handler and get a robot we have', function (done) {

    robotGetter = mapper.get({
      model: 'robots'
    });

    robotGetter(makeRequest({
      params: {
        _id: robotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(1);
      expect(result[0].data.robotNumber).to.equal(1);
    }));
  });

  it('Get a robot we do not have', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: '52f1b16197df290000930544'
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(0);
    }));
  });

  it('Create a list getter and get all robots.', function (done) {
    robotListGetter = mapper.get({
      model: 'robots'
    });
    robotListGetter(makeRequest(), makeResponseTester(200, done, function (
      result) {
      expect(result.length).to.equal(1);
    }));
  });

  it('Create a poster and post a new robot.', function (done) {
    robotPoster = mapper.post({
      model: 'robots'
    });
    robotPoster(makeRequest({
      body: {
        robotNumber: 2
      }
    }), makeResponseTester(200, done, function (result) {
      postedRobotId = result[0].data._id;
    }));
  });

  it('Get the posted robot.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(2);
    }));
  });

  it('Create an updater and update the posted robot.', function (done) {
    robotUpdater = mapper.put({
      model: 'robots'
    });
    robotUpdater(makeRequest({
      params: {
        _id: postedRobotId
      },
      body: {
        robotNumber: 3
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(3);
    }));
  });

  it('Get the updated robot.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(3);
    }));
  });

  it('Delete the updated robot.', function (done) {
    robotDeleter = mapper.del({
      model: 'robots'
    });
    robotDeleter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {

      expect(result).to.equal('1');
    }));
  });

  it('Check that the deleted robot is gone.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(0);

    }));
  });
});
