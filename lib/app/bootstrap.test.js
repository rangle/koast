'use strict';

var Q = require('q');
var chai = require('chai');
var should = chai.should();
var supertest = require('supertest');
var bootstrap = require('./bootstrap');

describe('Bootstrapper can load', function () {
  it('Should mount HW module and have route /hello/world.', function (done) {
    var app = bootstrap.getConfiguredApplication({
      routes: [{
        route: '/hello',
        type: 'module',
        module: 'test-data/modules/hello-world'
      }]
    });

    supertest(app)
      .get('/hello/world')
      .end(function (err, res) {
        res.text.should.equal('Hello, koast!');
        done(err);
      });
  });

  it('Should serve static files.', function (done) {
    var app = bootstrap.getConfiguredApplication({
      routes: [{
        route: '/hello',
        type: 'static',
        path: 'test-data/static-test'
      }]
    });

    supertest(app)
      .get('/hello/koast.txt')
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        res.text.should.equal('koast\n');
        done(err);
      });
  });


});

describe('Methods respond properly', function () {
  it('Should allow POST and GET.', function (done) {
    var app = bootstrap.getConfiguredApplication({
      routes: [{
        route: '/hello',
        type: 'module',
        module: 'test-data/modules/hello-post'
      }]
    });

    var d1 = Q.defer();
    supertest(app)
      .get('/hello/world')
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        res.text.should.equal('Hello, get!');
        d1.resolve();
      });


    var d2 = Q.defer();
    supertest(app)
      .post('/hello/world')
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        res.text.should.equal('Hello, post!');
        d2.resolve();
      });

    return Q.all([d1, d2])
      .then(function () {
        done();
      });
  });
});
