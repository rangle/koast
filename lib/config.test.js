/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

***REMOVED***
var config = require('./config');

describe('Test basic config loading.', function () {

  before(function () {

    config.setConfigDirectory(process.cwd() + '/test-data/unit-tests', {
***REMOVED***
***REMOVED***
***REMOVED***

  it('Load local config', function (done) {
    config.setEnvironment('local', {
***REMOVED***
    }).then(function () {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.env).to.equal('local');
      done();
    }).fail(done);
***REMOVED***

  it('Load staging config', function (done) {
    config.setEnvironment('staging', {
***REMOVED***
    }).then(function () {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.env).to.equal('staging');
      done();
    }).fail(done);
***REMOVED***

  it('Should contain common config bar and overwrite foo', function (
    done) {
    config.setEnvironment('local', {
***REMOVED***
    }).then(function () {
      var fooConfig = config.getConfig('foo');
      console.log(config.getConfig('testx'));
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.bar).to.equal(1337);
      expect(fooConfig.env).to.equal('local');
      done();
    }).fail(done);
***REMOVED***
***REMOVED***
