/* global require, describe, it, before, after */
/* jshint expr:true */

'use strict';
var expect = require('chai').expect;
var Q = require('q');
var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var supertest = require('supertest');

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

var config = require('../config');
var dbUtils = require('../database/db-utils');
var mongoMapper = require('../mongo-mapper/mongo-mapper');

describe('mongoMapper', function () {
  var mapper;
  var connection;
  var robotGetter;

  var robotListGetter;
  var robotPoster;
  var robotUpdater;
  var robotDeleter;
  var robotId;
  var postedRobotId;

  before(function () {

    /*config.setConfigDirectory('test-data/config/', {
      force: true
    });*/
    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.loadConfiguration('test', {
      force: true
    }).then(function () {
      dbUtils.reset();
      return;
    });

  });

  after(function () {
    return dbUtils.closeAllConnectionsNow();
  });

  it('should have a connection', function (done) {
    var connectionPromise = dbUtils.createConfiguredConnections(['db1']);
    expect(Q.isPromise(connectionPromise)).to.be.true;
    connectionPromise
      .then(function (connections) {
        expect(connections).to.be.an.array;
        expect(connections.length).to.equal(1);
        connection = connections[0];
        done();
      })
      .fail(done);
  });

  it('should initialize', function () {
    mapper = mongoMapper.makeMapper(connection);
    expect(mapper).to.not.be.undefined;
    expect(mapper).to.have.property('get');
  });

  it('Remove old robots', function (done) {
    connection.model('robots').remove({}, function (error, result) {
      expect(error).to.not.exist;
      done();
    });
  });

  it('Insert a robot', function (done) {
    connection.model('robots').create({
      robotNumber: 1
    }, function (error, result) {
      expect(error).to.not.exist;
      robotId = result._id;
      done();
    });
  });

  function makeResponseTester(expectedStatus, done, test) {
    return {
      setHeader: function () {},
      status: function (status) {

        expect(status).to.equal(expectedStatus);
        return this;
      },
      send: function (data) {

        if (test) {
          test(data);
        }
        done();
      }
    };
  }

  function makeRequest(config) {
    var request = _.clone(config || {});
    request.params = request.params || {};
    return request;
  }

  it('Create a get handler and get a robot we have', function (done) {

    robotGetter = mapper.get({
      model: 'robots'
    });

    robotGetter(makeRequest({
      params: {
        _id: robotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(1);
      expect(result[0].data.robotNumber).to.equal(1);
    }));
  });

  it('Get a robot we do not have', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: '52f1b16197df290000930544'
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(0);
    }));
  });

  it('Create a list getter and get all robots.', function (done) {
    robotListGetter = mapper.get({
      model: 'robots'
    });
    robotListGetter(makeRequest(), makeResponseTester(200, done,
      function (
        result) {
        expect(result.length).to.equal(1);
      }));
  });

  it('Create a poster and post a new robot.', function (done) {
    robotPoster = mapper.post({
      model: 'robots'
    });
    robotPoster(makeRequest({
      body: {
        robotNumber: 2
      }
    }), makeResponseTester(200, done, function (result) {
      postedRobotId = result[0].data._id;
    }));
  });

  it('Get the posted robot.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(2);
    }));
  });

  it('Create an updater and update the posted robot.', function (done) {
    robotUpdater = mapper.put({
      model: 'robots'
    });
    robotUpdater(makeRequest({
      params: {
        _id: postedRobotId
      },
      body: {
        robotNumber: 3
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(3);
    }));
  });

  it('Get the updated robot.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result[0].data.robotNumber).to.equal(3);
    }));
  });

  it('Delete the updated robot.', function (done) {
    robotDeleter = mapper.delete({
      model: 'robots'
    });
    robotDeleter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {

      expect(result).to.equal('1');
    }));
  });

  it('Check that the deleted robot is gone.', function (done) {
    robotGetter(makeRequest({
      params: {
        _id: postedRobotId
      }
    }), makeResponseTester(200, done, function (result) {
      expect(result.length).to.equal(0);

    }));
  });
});


describe('Error handling', function () {

  var dbConfig = {
    'host': '127.0.0.1',
    'port': '27017',
    'db': 'testdb'
  };

  var schemas = [{
    name: 'testcollection',
    properties: {
      prop: {
        type: Number,
        required: true
      }
    }
  }];

  var dbConn;
  before(function () {
    dbConn = dbUtils.createSingleConnection('testdb', dbConfig, schemas);
    return dbConn;
  });


  after(function () {
    return dbUtils.closeAllConnectionsNow();
  });


  it('Should return ValidationError when missing props', function (done) {
    dbConn.then(function (connection) {
        var mapConfig = {
          400: {
            sendValue: true
          },

          500: {
            sendValue: true
          }
        };

        var mapper = mongoMapper.makeMapper(connection, mapConfig);
        expect(mapper).to.not.be.undefined;

        var poster = mapper.post({
          model: 'testcollection'
        });

        var app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
          extended: true
        }));

        app.post('/x', poster);

        supertest(app)
          .post('/x')
          .send({
            x: 0
          })
          .expect(400)
          .end(function (err, res) {
            if (err) {
              done(err);
            }
            var data = JSON.parse(res.text);
            expect(data.name).to.equal('ValidationError');
            done();
          });
      })
      .catch(function (err) {
        console.log(err);
      });
  });


  it(
    'Should not return ValidationError text when missing prop if config says so',
    function (done) {
      dbConn.then(function (connection) {
          var mapConfig = {
            400: {
              sendValue: false
            },

            500: {
              sendValue: true
            }
          };

          var mapper = mongoMapper.makeMapper(connection, mapConfig);
          expect(mapper).to.not.be.undefined;

          var poster = mapper.post({
            model: 'testcollection'
          });

          var app = express();

          app.use(bodyParser.json());
          app.use(bodyParser.urlencoded({
            extended: true
          }));

          app.post('/x', poster);

          supertest(app)
            .post('/x')
            .send({
              x: 1
            })
            .expect(400)
            .end(function (err, res) {
              if (err) {
                done(err);
              }
              expect(res.text).to.equal('');
              done();
            });
        })
        .catch(function (err) {
          console.log(err);
        });

    });

  it('Should return a CastError on mismatched types', function (done) {
    dbConn.then(function (connection) {
        var mapConfig = {
          400: {
            sendValue: true
          },

          500: {
            sendValue: true
          }
        };

        var mapper = mongoMapper.makeMapper(connection, mapConfig);
        expect(mapper).to.not.be.undefined;

        var poster = mapper.post({
          model: 'testcollection'
        });

        var app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
          extended: true
        }));

        app.post('/x', poster);

        supertest(app)
          .post('/x')
          .send({
            prop: 'SHOULD NOT BE A STRING'
          })
          .expect(400)
          .end(function (err, res) {
            if (err) {
              done(err);
            }
            var data = JSON.parse(res.text);
            expect(data.name).to.equal('CastError');
            done();
          });
      })
      .catch(function (err) {
        console.log(err);
      });

  });

  it('Should use onError handler when supplied', function (done) {
    dbConn.then(function (connection) {
        var mapConfig = {
          onError: function (err, req, res) {
            res.status(500).send({
              x: 1
            });
          }
        };

        var mapper = mongoMapper.makeMapper(connection, mapConfig);
        expect(mapper).to.not.be.undefined;

        var poster = mapper.post({
          model: 'testcollection'
        });

        var app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
          extended: true
        }));

        app.post('/x', poster);

        supertest(app)
          .post('/x')
          .send({
            prop: 'SHOULD NOT BE A STRING'
          })
          .expect(500)
          .end(function (err, res) {
            if (err) {
              done(err);
              return;
            }
            var data = JSON.parse(res.text);
            expect(data.x).to.equal(1);
            done();
          });
      })
      .catch(function (err) {
        console.log(err);
      });

  });

});

describe.only('mono mapper annotator functionality', function () {
  var dbConfig = {
    'host': '127.0.0.1',
    'port': '27017',
    'db': 'testdb'
  };

  var schemas = [{
    name: 'annotatorTest',
    properties: {
      title: {
        type: String,
        required: false,
      },
      firstName: {
        type: String,
        required: false,
      }
    }
  }];

  var dbConn;

  var data = [{
    title: 'item 1',
    firstName: 'Evan'
  }, {
    title: 'item 2',
    firstName: 'Raf'
  }, {
    title: 'item 3',
    firstName: 'Yuri'
  }];

  var mapConfig = {
    400: {
      sendValue: true
    },

    500: {
      sendValue: true
    }
  };

  var mapperOptions = {
    useEnvelope: true,
    queryDecorator: function () {},
    filter: function () {
      return true;
    },
    annotator: sinon.spy(function (result, req) {
      result.data.firstName = result.data.firstName.toUpperCase();
    })
  };


  before(function () {
    var deferred = Q.defer();

    dbConn = dbUtils.createSingleConnection('testdb', dbConfig, schemas)
      .then(function (connection) {
        var deferred = Q.defer();
        var model = connection.model('annotatorTest');
        model.remove({}, function (error, result) {
          expect(error).to.be.null;
          model.create(data, function (error, result) {
            expect(error).to.be.null;
            model.find({}, function (error, result) {
              expect(error).to.be.null;
              expect(result.length).to.be.equal(3);
              deferred.resolve(connection);
            });
          });
        });
        return deferred.promise;
      });
    return dbConn;


  });


  function makeExpressApp(connection) {
    var mapper = mongoMapper.makeMapper(connection);

    mapper.options = mapperOptions;

    var app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    var getter = mapper.get({
      model: 'annotatorTest'
    });

    app.get('/x', getter);
    return app;

  }
  after(function () {
    return dbUtils.closeAllConnectionsNow();

  });

  it('should run the annotator on the collection', function (done) {


    return dbConn.then(function (connection) {

      var app = makeExpressApp(connection);

      supertest(app)
        .get('/x')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(err).to.be.null;
          var result = JSON.parse(res.text);
          expect(result[0].data.firstName).to.be.equal('EVAN');
          done();
        });

    }).then(null, done);
  });

  it('should run the annotator each item in the collection', function (done) {


    return dbConn.then(function (connection) {

      var app = makeExpressApp(connection);

      supertest(app)
        .get('/x')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          expect(err).to.be.null;
          mapperOptions.annotator.should.have.been.calledThirce;
          done();
        });

    }).then(null, done );
  });



});
