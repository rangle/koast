'use strict';

***REMOVED***
// var Q = require('q');
// var _ = require('underscore');
// ***REMOVED***
// var dbUtils = require('../database/db-utils');
var authentication = require('./authentication');

var
//mongooseMock = require('mongoose-mock'),
//proxyquire = require('proxyquire'),
chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require("sinon-chai");
chai.use(sinonChai);


describe('Authentication', function() {
  it('should save a user with an encrypted password', function(done) {

    var callback = sinon.spy();

    var name = 'someName';
    var user = {
      save: function(cb) {
        cb(null, {
          username: name
    ***REMOVED***
***REMOVED***
***REMOVED***

    authentication.saveUser(user, 'somePassword')
      .then(function(res) {
        expect(res.username).to.equal(name);
        //expect(res.password).to.not.be.undefined;

        done();
  ***REMOVED***
***REMOVED***
***REMOVED***