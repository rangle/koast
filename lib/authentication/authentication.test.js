/* jshint expr:true */
/* global require, describe, it, before, after */

'use strict';

var expect = require('chai').expect,
  Q = require('q'),
  _ = require('underscore'),
  config = require('../config'),
  dbUtils = require('../database/db-utils'),
  express = require('express'),
  authentication = require('./authentication'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai);


function makeResponseTester(expectedStatus, done, test) {
  return {
    setHeader: function() {},
    status: function(status) {
      expect(status).to.equal(expectedStatus);
      return this;
    },
    send: function(data) {

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

describe('Authentication', function() {

  before(function() {
    config.setConfigDirectory('test-data/config/', {
      force: true
    });
    config.loadConfiguration('test', {
      force: true
    });
    dbUtils.reset();
  });

  after(function() {
    return dbUtils.closeAllConnectionsNow();
  });

  it('should save a user with an encrypted password', function(done) {

    var callback = sinon.spy();

    var name = 'someName';
    var user = {
      save: function(cb) {
        cb(null, {
          username: name
        });
      }
    };

    authentication.saveUser(user, 'somePassword')
      .then(function(res) {
        expect(res.username).to.equal(name);
        //expect(res.password).to.not.be.undefined;
        done();
      });
  });


});

describe('Authentication Routes', function() {
  var schemas = [{
    name: 'users',
    properties: {

      username: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      }
    }
  }, {
    name: 'userProviderAccounts',
    properties: {
      username: {
        type: String
      }, // Assigned by us
      provider: {
        type: String,
        enum: ['google', 'twitter', 'facebook'],
        required: true
      },
      idWithProvider: {
        type: String,
        required: true
      }, // Assigned by the provider
      emails: [{
        type: String
      }],
      displayName: {
        type: String
      },
      oauthToken: {
        type: String
      },
      oauthSecret: {
        type: String
      },
      tokenExpirationDate: {
        type: Date
      }
    }
  }];

  var connectionPromise;
  var connection;

  function getRoute(routes, method, route) {
    return _.where(routes, {
      route: route,
      method: method
    });
  }

  function saveUser(connection) {

    var User = connection.model('users');
    return authentication.saveUser(new User({
      username: 'test'
    }), '1234');
  }

  before(function() {


    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.loadConfiguration('test', {
      force: true
    }).then(function() {
      dbUtils.reset();

      connectionPromise = dbUtils.createSingleConnection('_',
        config.getConfig('anotherDb'),
        schemas).then(function(result) {
        authentication.addAuthenticationRoutes({
          post: function() {},
          get: function() {}
        });
        connection = dbUtils.getConnectionNow();
        return saveUser(connection).then(function(r) {
          return authentication;
        });
      });

      // populate dummy user

    });
  });

  after(function() {
    var cleanup = Q.defer();
    connection.model('users').remove({}, function(err, response) {
      cleanup.resolve();
    });
    cleanup.promise.then(function() {
      return dbUtils.closeAllConnectionsNow();
    });
    return cleanup.promise;

  });


  it('should define the routes', function(done) {
    connectionPromise.then(function(auth) {
      expect(auth.routes).to.not.be.undefined;
      expect(auth.routes.length).to.be.above(1);
      done();
    }).fail(done);
  });

  it('should have a an get auth/user route', function(done) {
    connectionPromise.then(function(auth) {
      var route = getRoute(auth.routes, 'get', 'auth/user');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

  });

  it('should have a an post auth/user route', function(done) {
    connectionPromise.then(function(auth) {
      var route = getRoute(auth.routes, 'post', 'auth/user');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

  });

  it('should have a an put auth/user route', function(done) {
    connectionPromise.then(function(auth) {
      var route = getRoute(auth.routes, 'put', 'auth/user');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

  });

  it('should have a an post auth/logout route', function(done) {
    connectionPromise.then(function(auth) {
      var route = getRoute(auth.routes, 'post', 'auth/logout');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

  });

  it('should have a an get auth/usernameAvailable route', function(done) {
    connectionPromise.then(function(auth) {
      var route = getRoute(auth.routes, 'get',
        'auth/usernameAvailable');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);
  });

  describe('getAuthUsernameAvailable', function() {
    var getAuthUsernameAvailable;
    var routeHandler;
    before(function() {

      getAuthUsernameAvailable = connectionPromise.then(function(
        auth) {
        routeHandler = getRoute(auth.routes, 'get',
          'auth/usernameAvailable')[0].handler;
        return routeHandler;
      });

      return getAuthUsernameAvailable;
    });

    it('should return a status of 400 if no query string is provided',
      function(
        done) {
        routeHandler(makeRequest({}), makeResponseTester(400, done));
      });

    it(
      'should return a status of 400 if no username is provided in query',
      function(
        done) {
        routeHandler(makeRequest({
          query: {}
        }), makeResponseTester(400, done));
      });

    it(
      'should return a status of 200 true returned if the name is not found',
      function(
        done) {

        routeHandler(makeRequest({
          query: {
            username: 'test1'
          }
        }), makeResponseTester(200, done, function(result) {

          expect(result).to.be.true;
        }));
      });

    it(
      'should return a status of 200, false returned if the name is  found',
      function(
        done) {

        routeHandler(makeRequest({
          query: {
            username: 'test'
          }
        }), makeResponseTester(200, done, function(result) {

          expect(result).to.be.false;
        }));
      });
  });
});