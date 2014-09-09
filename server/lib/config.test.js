/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

***REMOVED***
var config = require('./config');

describe('Test basic config loading.', function() {

***REMOVED***
    config.setConfigDirectory('server/test-data/unit-tests/config/', {force: true***REMOVED***
***REMOVED***

  it('Load local config', function() {
    config.setEnvironment('local', {force: true***REMOVED***
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.foo).to.equal(42);
    expect(fooConfig.env).to.equal('local');
***REMOVED***

  it('Load staging config', function() {
    config.setEnvironment('staging', {force: true***REMOVED***
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.env).to.equal('staging');
***REMOVED***

  it('Should contain common config bar and overwrite foo', function() {
    config.setEnvironment('local', {force: true***REMOVED***
    var fooConfig = config.getConfig('foo');
    expect(fooConfig).to.not.be.undefined;
    expect(fooConfig.foo).to.equal(42);
    expect(fooConfig.bar).to.equal(1337);
    expect(fooConfig.env).to.equal('local');
***REMOVED***
***REMOVED***

