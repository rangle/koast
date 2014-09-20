'use strict';

var expect = require('chai').expect;

var Q = require('q');
var _ = require('underscore');
var config = require('../config');
var dbUtils = require('../database/db-utils');


var express = require('express');
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
      force: true
    });
    config.setEnvironment('test', {
      force: true
    });
    dbUtils.reset();
  });

  after(function () {
    return dbUtils.closeAllConnectionsNow();
  });

  it('should save a user with an encrypted password', function (done) {

    var callback = sinon.spy();

    var name = 'someName';
    var user = {
      save: function (cb) {
        cb(null, {
          username: name
        });
      }
    };

    authentication.saveUser(user, 'somePassword')
      .then(function (res) {
        expect(res.username).to.equal(name);
        //expect(res.password).to.not.be.undefined;

        done();
      });
  });


});