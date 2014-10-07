/* global require, describe, it, console */

'use strict';

var expect = require('chai').expect;

var koast = require('../index');
koast.setConfigDirectory('tests/config/');
koast.setEnvironment('test');

describe('Basic app setup.', function () {
  var appConfig = koast.getConfig('app');

  it('Initialize a db connection.', function(done) {
    koast.createDatabaseConnections()
      .then(function (connection) {
        console.log('Resolved the connection');
        expect(connection).to.not.be.undefined;
        console.log('Good');
        done();
      });
  });

  it('Make an app', function() {
    var app = koast.makeExpressApp(appConfig);
    expect(app).to.not.be.undefined;
  });

});