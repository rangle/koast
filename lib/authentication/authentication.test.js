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
    setHeader: function () {},
    status: function (status) {
      expect(status).to.equal(expectedStatus);
      return this;
    },
    send: function (data) {

      if (test) {
        test(data);
***REMOVED***
      done();
    }
  };
}

function makeRequest(config) {
  var request = _.clone(config || {***REMOVED***
  request.params = request.params || {};
  return request;
}

describe('Authentication', function () {

  before(function () {
    config.setConfigDirectory('test-data/config/', {
***REMOVED***
***REMOVED***
    config.setEnvironment('test', {
***REMOVED***
***REMOVED***
    dbUtils.reset();
***REMOVED***

  after(function () {
    return dbUtils.closeAllConnectionsNow();
***REMOVED***

  it('should save a user with an encrypted password', function (done) {

    var callback = sinon.spy();

    var name = 'someName';
    var user = {
      save: function (cb) {
        cb(null, {
          username: name
    ***REMOVED***
***REMOVED***
***REMOVED***

    authentication.saveUser(user, 'somePassword')
      .then(function (res) {
        expect(res.username).to.equal(name);
        //expect(res.password).to.not.be.undefined;
        done();
  ***REMOVED***
***REMOVED***


***REMOVED***

describe('Authentication Routes', function () {
  var schemas = [{
    name: 'users',
    properties: {

      username: {
        type: String,
        required: true,
        unique: true
***REMOVED***
      password: {
        type: String,
        required: true
***REMOVED***
    }
  }, {
    name: 'userProviderAccounts',
    properties: {
      username: {
        type: String
***REMOVED*** // Assigned by us
      provider: {
        type: String,
        enum: ['google', 'twitter', 'facebook'],
        required: true
***REMOVED***
      idWithProvider: {
        type: String,
        required: true
***REMOVED*** // Assigned by the provider
      emails: [{
        type: String
***REMOVED***],
      displayName: {
        type: String
***REMOVED***
      oauthToken: {
        type: String
***REMOVED***
      oauthSecret: {
        type: String
***REMOVED***
      tokenExpirationDate: {
        type: Date
***REMOVED***
    }
  }];

  var connectionPromise;
  var connection;

  function getRoute(routes, method, route) {
    return _.where(routes, {
      route: route,
      method: method
***REMOVED***
  }

  function saveUser(connection) {

    var user = connection.model('users');
    return authentication.saveUser(new user({
      username: 'test'
    }), '1234');
  }

  before(function () {


***REMOVED***
***REMOVED***
***REMOVED***
    return config.setEnvironment('test', {
***REMOVED***
    }).then(function () {
      dbUtils.reset();

      connectionPromise = dbUtils.createSingleConnection('_',
        config.getConfig('anotherDb'),
        schemas).then(function (result) {
        authentication.addAuthenticationRoutes({
          post: function () {},
          get: function () {}
    ***REMOVED***
        connection = dbUtils.getConnectionNow();
        return saveUser(connection).then(function (r) {
          return authentication;
    ***REMOVED***
  ***REMOVED***

      // populate dummy user

***REMOVED***
***REMOVED***

  after(function () {
    var cleanup = Q.defer();
    connection.model('users').remove({}, function (err, response) {
      cleanup.resolve();
***REMOVED***
    cleanup.promise.then(function () {
      return dbUtils.closeAllConnectionsNow();
    })
    return cleanup.promise;

***REMOVED***


  it('should define the routes', function (done) {
    connectionPromise.then(function (auth) {
      expect(auth.routes).to.not.be.undefined;
      expect(auth.routes.length).to.be.above(1);
      done();
    }).fail(done)
***REMOVED***

  it('should have a an get auth/user route', function (done) {
    connectionPromise.then(function (auth) {
      var route = getRoute(auth.routes, 'get', 'auth/user');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

***REMOVED***

  it('should have a an post auth/user route', function (done) {
    connectionPromise.then(function (auth) {
      var route = getRoute(auth.routes, 'post', 'auth/user');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

***REMOVED***

  it('should have a an put auth/user route', function (done) {
    connectionPromise.then(function (auth) {
      var route = getRoute(auth.routes, 'put', 'auth/user');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

***REMOVED***

  it('should have a an post auth/logout route', function (done) {
    connectionPromise.then(function (auth) {
      var route = getRoute(auth.routes, 'post', 'auth/logout');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);

***REMOVED***

  it('should have a an get auth/usernameAvailable route', function (done) {
    connectionPromise.then(function (auth) {
      var route = getRoute(auth.routes, 'get', 'auth/usernameAvailable');
      expect(route.length).to.equal(1);
      done();
    }).fail(done);
***REMOVED***

  describe('getAuthUsernameAvailable', function () {
    var getAuthUsernameAvailable;
    var routeHandler;
    before(function () {

      return getAuthUsernameAvailable = connectionPromise.then(function (
        auth) {
        routeHandler = getRoute(auth.routes, 'get',
          'auth/usernameAvailable')[0].handler;
        return routeHandler;
  ***REMOVED***
***REMOVED***

    it('should return a status of 400 if no query string is provided',
      function (
        done) {
        routeHandler(makeRequest({}), makeResponseTester(400, done));
  ***REMOVED***

    it('should return a status of 400 if no username is provided in query',
      function (
        done) {
        routeHandler(makeRequest({
          query: {}
***REMOVED***), makeResponseTester(400, done));
  ***REMOVED***

    it(
      'should return a status of 200 true returned if the name is not found',
      function (
        done) {

        routeHandler(makeRequest({
          query: {
            username: 'test1'
  ***REMOVED***
***REMOVED***), makeResponseTester(200, done, function (result) {

          expect(result).to.be.true;
***REMOVED***));
  ***REMOVED***

    it(
      'should return a status of 200, false returned if the name is  found',
      function (
        done) {

        routeHandler(makeRequest({
          query: {
            username: 'test'
  ***REMOVED***
***REMOVED***), makeResponseTester(200, done, function (result) {

          expect(result).to.be.false;
***REMOVED***));
  ***REMOVED***
  })
***REMOVED***
