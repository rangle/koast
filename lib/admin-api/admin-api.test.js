/* jshint expr:true */
/* global require, describe, it, before, after, beforeEach, process */
'use strict';

var R = require('ramda');
var q = require('q');
var _ = require('underscore');
var log = require('koast-logger');
var express = require('express');
var supertest = require('supertest');
var expect = require('chai').expect;

var mockery = require('mockery');
var mongoDbMock = require('./mongoDbMock.js');

var adminApi;

var backupMock = {
  hanglers: {},
  create: function(mongoUri, collections, type, opts) {
    var receipts = [];
    R.map(function(value) {
      return {
        collection: value,
        data: {
          key: 'key',
          bucket: 'mock_bucket'
        }
      };
    }, collections);
    return q(receipts);
  },
  registerHandler: function(type, handler) {

  }
};

//
//var targetMongoUri = 'mongodb://localhost:27017/koast1';
//
/*var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;*/

var adminConfig = {
  aws: {
    key: process.env.AWS_ACCESS,
    secret: process.env.AWS_SECRET
  },

  backups: {
    target: 'mongodb://localhost:27017/koast-to-do-application' //Database to backup
  },

  database: { //Database usennpd to store admin metadata
    url: 'mongodb://localhost:27017/koast_db'
  }
};
var adminModule;
var db;
var sampleBackupList = [{
  '_id' : '54b68359569a743107635210',
  'type' : 's3',
  'receipts' : [
    {
      'collection' : 'tasks',
      'data' : {
        'key' : 'asdf',
        'bucket' : 'test-koast'
      }
    }
  ],
  'name' : 'asdf',
  'timestamp' : '2015-01-14T14:55:19.906Z',
  'backupId' : '5bea2420-9bfd-11e4-8d52-c7f875d48ffa'
}];

before(function() {
  mockery.enable({
    warnOnReplace: true
  });
  mockery.registerMock('mongodb', mongoDbMock );
  mockery.registerMock('./backup/backup', backupMock);
  adminApi = require('./admin-api');
});

after(function() {
  mockery.deregisterAll();
  mockery.disable();
});

describe('Admin api tests', function() {
  before(function() {
    adminModule = adminApi.genKoastModule(adminConfig).router;
  });

  after(function() {
    adminModule = null;
  });

  it('should present a discovery json object', function(done) {
    //expect(true).to.equal(true);
    var expectedObject = {
      backup:
      {
        list:
        {
          GET: '/resources/backup/list'
        },
        stat:
        {
          GET: '/resources/backup/stat/:id'
        },
        start:
        {
          POST: '/resources/backup/start'
        },
        restore:
        {
          POST: '/resources/backup/restore'
        }
      }
    };
    adminModule.then(function(app) {
      supertest(app)
        .get('/discovery')
        .expect(200)
        .expect(expectedObject)
        .end(done);
    });
  });

  describe('Retrieving backup information', function () {
    before(function() {
      db = mongoDbMock.MongoClient.getDb();
      db.registerCollection('backups', sampleBackupList);
      adminModule = adminApi.genKoastModule(adminConfig).router;
    });

    it('should have a backup list page', function(done) {
      adminModule.then(function(app) {
        var expectedOutput = [{
          '_id' : '54b68359569a743107635210',
          'type' : 's3',
          'receipts' : [
            {
              'collection' : 'tasks',
              'data' : {
                'key' : 'asdf',
                'bucket' : 'test-koast'
              }
            }
          ],
          'name' : 'asdf',
          'timestamp' : '2015-01-14T14:55:19.906Z',
          'backupId' : '5bea2420-9bfd-11e4-8d52-c7f875d48ffa'
        }];
        supertest(app)
          .get('/resources/backup/list')
          .expect(200)
          .expect(function (res) {
            expect(JSON.parse(res.text)).to.deep.equal(expectedOutput);
          })
          .end(done);
      });
    });

    it('should provide the status of a single requested backup', function(done) {
      adminModule.then(function(app) {
        var backupId = '5bea2420-9bfd-11e4-8d52-c7f875d48ffa';
        var resourceString = '/resources/backup/stat/'+backupId;
        supertest(app)
          .get(resourceString)
          .expect(200)
          .expect(function (res) {
            expect(res.text).to.equal('{"status":"saved"}');
          })
          .end(done);
      });
    });

    it('should provide a 500 status if mongo error occurs', function(done) {
      db.collection('backups').setError('no collection name', 10011);  //FIXME: May not be an appropriate error.
      adminModule.then(function(app) {
        var backupId = '5bea2420-9bfd-11e4-8d52-c7f875d48ffa';
        var resourceString = '/resources/backup/stat/'+backupId;
        supertest(app)
          .get(resourceString)
          .expect(500)
          .end(done);
      });
      db.clearError();
    });

    it('should write a successful backup record to the database', function(done) {
      adminModule.then(function(app) {
        supertest(app)
          .post('/resources/backup/start')
          .send({
            collections: ['tasks'],
            type: 's3',
            name: 'mockBackup',
            opts: {
              name: 'mockBackup',
              bucket: 'mock_bucket'
            }})
          .end(function(error, res) {
            var result;
            try {
              result = JSON.parse(res.text);
            } catch (e) {
              console.log(e);
            }
            expect(result).to.have.property('id');
            done();
          });
      });
    });
  });
});

mockery.disable();

