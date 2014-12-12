'use strict';

var q = require('q');
var express = require('express');
var supertest = require('supertest');

var adminApi = require('./admin-api');

var targetMongoUri = 'mongodb://localhost:27017/dumptestdb';

var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;


describe('Invalid configurations', function() {
  //TODO
});

describe('Mongo destination', function() {
  it('Should do stuff', function(done) {

    var conf = {
      backups: {
        storage: ['s3', 'fs'],
        mongo: {
          target: {
            uri: targetMongoUri,
            collections: ['multi_a', 'multi_b']   
          },
          
          dest: {
            uri: 'asd',
            collection: 'backupLocations'
          }
        },

        aws: {
          global: {
            accessKeyId: access,
            secretAccessKey: secret
          },

          s3: {
            bucket: bucket
          }
        }
      }
    };

    var adminRouter = adminApi.getRouter(conf);

    var app = express();
    app.use('/', adminRouter);

    supertest(app)
      .post('/backups/s3')
      .end(function(err, res) {
        console.log(res.body);
      });

  });
});
