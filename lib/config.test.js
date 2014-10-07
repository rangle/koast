/* jshint expr:true */
/* global require, describe, it, before, after */
'use strict';

var expect = require('chai').expect;
var config = require('./config');

describe('Test basic config loading.', function() {

  before(function() {

    config.setConfigDirectory(process.cwd() + '/test-data/unit-tests', {
      force: true
    });
  });

  it('Load local config', function() {
    return config.loadConfiguration('local', {
      force: true
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.env).to.equal('local');
      return;
    });
  });

  it('Load staging config', function() {
    return config.loadConfiguration('staging', {
      force: true
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.env).to.equal('staging');
      return;
    });
  });

  it('Should contain common config bar and overwrite foo', function() {
    return config.loadConfiguration('local', {
      force: true
    }).then(function() {
      var fooConfig = config.getConfig('foo');
      console.log(config.getConfig('testx'));
      expect(fooConfig).to.not.be.undefined;
      expect(fooConfig.foo).to.equal(42);
      expect(fooConfig.bar).to.equal(1337);
      expect(fooConfig.env).to.equal('local');
      return;
    });
  });
});
describe('Setting configuration explicitly', function() {
  it(
    'should override base koast settings with provided base configuration',
    function() {

      var options = {
        force: true,
        baseConfiguration: {
          app: {
            port: 2600
          }
        }

      };

      return config.loadConfiguration('randomTest', options).then(
        function(
          result) {
          expect(result.get('app').port).to.be.equal(2600);
          return;
        });
    });

  it('should override base koast settings app configuration if provided',
    function() {

      var options = {
        force: true,
        appConfiguration: {
          app: {
            port: 2600,
          }
        }

      };

      return config.loadConfiguration('randomTest', options).then(
        function(
          result) {
          expect(result.get('app').port).to.be.equal(2600);
          return;
        });
    });

  it('should merge base and app configuration if provided', function() {
    var options = {
      force: true,
      baseConfiguration: {
        app: {
          port: 2600
        },

      },
      appConfiguration: {
        app: {
          port: 2601,
          someKey: 'myValue'
        }
      }
    };
    return config.loadConfiguration('myEnv', options).then(function(
      result) {
      expect(result.get('app').port).to.be.equal(2601);
      expect(result.get('app').someKey).to.be.equal('myValue');
      return;
    });
  });
});