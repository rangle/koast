/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

***REMOVED***
var config = require('./config');

describe('Test basic config loading.', function() {

***REMOVED***

    config.setConfigDirectory(process.cwd() + '/test-data/unit-tests', {
***REMOVED***
***REMOVED***
***REMOVED***

  it('Load local config', function() {
    return config.loadConfiguration('local', {
***REMOVED***
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.env).to.equal('local');
      return;
***REMOVED***
***REMOVED***

  it('Load staging config', function() {
    return config.loadConfiguration('staging', {
***REMOVED***
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.env).to.equal('staging');
      return;
***REMOVED***
***REMOVED***

  it('Should contain common config bar and overwrite foo', function() {
    return config.loadConfiguration('local', {
***REMOVED***
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      console.log(config.getConfig('testx'));
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.bar).to.equal(1337);
      expect(fooConfig.env).to.equal('local');
      return;
***REMOVED***
***REMOVED***
***REMOVED***
describe('Setting configuration explicitly', function() {
  it(
    'should override base koast settings with provided base configuration',
    function() {

      var options = {
  ***REMOVED***,
        baseConfiguration: {
          app: {
            port: 2600
  ***REMOVED***
***REMOVED***

***REMOVED***;

      return config.loadConfiguration('randomTest', options).then(
        function(
          result) {
          expect(result.get('app').port).to.be.equal(2600);
          return;
    ***REMOVED***
***REMOVED***

  it('should override base koast settings app configuration if provided',
    function() {

      var options = {
  ***REMOVED***,
        appConfiguration: {
          app: {
            port: 2600,
  ***REMOVED***
***REMOVED***

***REMOVED***;

      return config.loadConfiguration('randomTest', options).then(
        function(
          result) {
          expect(result.get('app').port).to.be.equal(2600);
          return;
    ***REMOVED***
***REMOVED***

  it('should merge base and app configuration if provided', function() {
    var options = {
***REMOVED***,
      baseConfiguration: {
        app: {
          port: 2600
  ***REMOVED***

***REMOVED***
      appConfiguration: {
        app: {
          port: 2601,
          someKey: 'myValue'
***REMOVED***
***REMOVED***
***REMOVED***
    return config.loadConfiguration('myEnv', options).then(function(
      result) {
      expect(result.get('app').port).to.be.equal(2601);
      expect(result.get('app').someKey).to.be.equal('myValue');
      return;
***REMOVED***
***REMOVED***
***REMOVED***