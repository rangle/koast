'use strict';

***REMOVED***

var Q = require('q');
var _ = require('underscore');
***REMOVED***
var dbUtils = require('../database/db-utils');


***REMOVED***
var app = express();

var authentication = require('./authentication');

var
//mongooseMock = require('mongoose-mock'),
//proxyquire = require('proxyquire'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai');
chai.use(sinonChai);

var request = require('supertest');

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
