'use strict';

var Q = require('Q');
var chai = require('chai');
var should = chai.should();
var supertest = require('supertest');
var express = require('express');
var koastRouter = require('../koast-router')
var expect = chai.expect;
var assert = chai.assert;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

describe('koast router', function () {


  var basicRoute = [{
    method: 'get',
    route: 'test',
    handler: successHandler
  }];

  var middlewareFactoryRoute = [{
    method: ['post', 'get'],
    route: 'test',
    handler: factoryFunction
  }];

  function factoryFunction(config) {
    var method = config.method.toLowerCase();

    var handlers = {
      'get': successHandler,
      'post': successHandler

    }
    return handlers[method.toLowerCase()];

  }

  factoryFunction.isMiddlewareFactory = true;

  function successHandler(req, res) {
    res.status(200).send('success');
  }



  function defaultEndHandler(done) {
    return function defaultEnd(err, res) {
      if (err) {
        return done(err)
      } else {
        done();
      }
    }
  }
  it('should throw an error if the first argument is not an array', function () {
    assert.throw(koastRouter, Error,
      'koastRouter expects first paramater to be an array');
  });

  it('should throw an error if a route does not have method defined',
    function () {

      function testRouter() {
        return koastRouter([{}]);
      }

      assert.throw(testRouter, Error,
        'Error processing field method in subroute.');
    });

  it('should throw an error if a route does not have route defined',
    function () {

      function testRouter() {
        return koastRouter([{
          method: 'get'
        }]);
      }

      assert.throw(testRouter, Error,
        'Error processing field route in subroute.');
    });

  it('should throw an error if a route does not have handler defined',
    function () {

      function testRouter() {
        return koastRouter([{
          method: 'get',
          route: '/'
        }]);
      }

      assert.throw(testRouter, Error,
        'Error processing field handler in subroute.');
    });

  it(
    'should throw an error if method is not a string, or an array of strings',
    function () {
      function testRouter() {
        return koastRouter([{
          method: 1,
          route: '/',
          handler: function (req, res) {}
        }]);
      }
      assert.throw(testRouter, Error,
        'Field "method" should be set either set either to a method name or an array of method names.'
      );

    });

  it('should have a mounted route available', function (done) {

    var router = koastRouter(basicRoute);
    var app = express();

    app.use('/', router);


    supertest(app).get('/test').end(function (err, res) {
      if (err) {
        return done(err);
      } else {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('success');
        done();
      }
    });
  });

  it('should default to no authorization if no defaults are provided',
    function (done) {
      var router = koastRouter(basicRoute);
      var app = express();

      app.use('/', router);
      supertest(app)
        .get('/test')
        .expect(200)
        .expect('success')
        .end(function (err, res) {
          if (err) {
            return done(err);
          } else {
            done();
          }
        });

    });

  it('should call provided authorization function', function (done) {
    var authFunction = sinon.spy(function (req, res) {
      return true;
    });
    var router = koastRouter(basicRoute, {
      authorization: authFunction
    });

    var app = express();
    app.use('/', router);
    supertest(app).get('/test')
      .end(function (err, res) {
        if (err) {
          return done(err);
        } else {
          authFunction.should.have.been.calledOnce;
          done();
        }
      });
  });

  it('should use provided authorization, return 401 if denied', function (
    done) {

    function authFunction(req, res) {
      return false;
    }

    var router = koastRouter(basicRoute, {
      authorization: authFunction
    });

    var app = express();
    app.use('/', router);
    supertest(app).get('/test')
      .expect(401)
      .end(defaultEndHandler(done));
  });

  it('should use provided authorization, return 200 if accepted', function (
    done) {

    var authFunction = sinon.spy(function (req, res) {
      return true;
    })


    var router = koastRouter(basicRoute, {
      authorization: authFunction
    });

    var app = express();
    app.use('/', router);
    supertest(app).get('/test')
      .expect(200)
      .end(defaultEndHandler(done));
  });

  it('should handle a middleware factory, use get', function (done) {
    // middlewareFactoryRoute has get and post defined
    var router = koastRouter(middlewareFactoryRoute);
    var app = express();

    app.use('/', router);
    supertest(app)
      .get('/test')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        expect(res.status).to.equal(200);
        expect(res.text).to.equal('success')
        done();
      });


  });
  it('should handle a middleware factory, use post', function (done) {
    // middlewareFactoryRoute has get and post defined
    var router = koastRouter(middlewareFactoryRoute);
    var app = express();

    app.use('/', router);
    supertest(app)
      .post('/test')
      .send({})
      .end(function (err, res) {
        if (err) {
          console.log("Error", err);
          return done(err);
        }
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('success')
        done();
      });


  });

  it('should return a 404 if there is no route for middleware factory',
    function (done) {
      // middlewareFactoryRoute has get and post defined
      var router = koastRouter(middlewareFactoryRoute);
      var app = express();

      app.use('/', router);
      supertest(app)
        .put('/test')
        .send({})
        .end(function (err, res) {
          if (err) {
            console.log("Error", err);
            return done(err);
          }
          expect(res.status).to.equal(404);
          done();
        });
    });

});
