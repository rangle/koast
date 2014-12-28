/* global require, console */

'use strict';

var q = require('q');
var os = require('os');
var fs = require('fs');
var R = require('ramda');
var _ = require('underscore');
var log = require('koast-logger');
var express = require('express');
var request = require('request');
var mongoUri = require('mongo-uri');

var mds = require('mongodump-stream');
var MongoClient = require('mongodb').MongoClient;

var sprawn = require('./sprawn');
var backup = require('./backup/backup');

function collectionToS3(collectionName, key, stream, awsGlobal, awsS3) {
  return mds.dump.s3(key, stream, {
    key: awsGlobal.accessKeyId,
    secret: awsGlobal.secretAccessKey,
    bucket: awsS3.bucket
  }, log.error).then(function(res) {
    return {collection: collectionName,
            url: res.Location}; // TODO
  }, log.error);
}

function allCollectionsToS3(mongoUri, collections, awsGlobal, awsS3, dbCollection) {
  var bid;

  return function(backupId, start) {
    bid = backupId;
    start = new Date(start);

    return mds.slurp.multiBinary(mongoUri, collections, function(stream, coll) {
      
      var d = start.getDate();
      var m = start.getMonth() + 1;
      var y = start.getFullYear();
      var h = start.getHours();
      var m = start.getMinutes();
      var s = start.getSeconds();

      var key = [y, '-', m, '-', d, '-', h, ':', m, ':', s,
           '_', backupId, '_', coll].join('');

      // return promise and resolve location
      return collectionToS3(coll, key, stream, awsGlobal, awsS3);
    }).then(function(data) {
      //backup to mongo hurr

      dbCollection.insert({backupId: bid, data: data}, function(err, result) {
        if(err) { throw err; }
      });

      return data;
    }, log.error);
  };
}

function getS3BackupRouter(target, dbCollection, awsConfig) {
  var router = express.Router();

  router.post('/s3', backup.initiateBackupHandler(
        allCollectionsToS3(target.uri, target.collections,
          awsConfig.global, awsConfig.s3, dbCollection)));

  router.get('/s3/:backupId', backup.retrieveBackupStatus);

  return router;
}

function isArray(val) {
  return val.constructor === Array;
}

function restoreBinaryFromUrl(url, db, collection) {
  var deferred = q.defer();

  var tmpDir = os.tmpdir();
  var now = Date.now();
  var fpath = tmpDir + '/' + now + '.bson';

  var cmd = 'mongorestore';
  var args = ['--db', db, '--collection', collection, fpath];
  
  // make req for file, assume buffer is buf
  var outStream = fs.createWriteStream(fpath);
  request.get(url).pipe(outStream);

  outStream.on('finish', function() {
    sprawn.resolve(cmd, args).then(function() { 
      console.log('done?');
      deferred.resolve();
    });
  });

  return deferred.promise;
}

/**
 * cb should return a promise that resolves when it's done
 */
function getAdminApiRouter(conf) {

  var deferred = q.defer();
  
  var router = express.Router();
  var discoveryData = {};

  if(!conf.backups.mongo.dest) {
    throw 'No destination mongo config present';
  }

  var mongoDestUri = conf.backups.mongo.dest.uri;
  var mongoDestCollection = conf.backups.mongo.dest.collection;

  MongoClient.connect(mongoDestUri, function(err, db) {
    if(err) { throw err; }
  
    if(conf.backups) {
      if(conf.backups.storage) {

        discoveryData.backups = discoveryData.backups || {};
    
        var storages = conf.backups.storage;
        if(!isArray(storages)) {
          throw 'backups.storage is not an Array';
        }

        if(!conf.backups.mongo.target) {
          throw 'No target mongo config present';
        }

        var targetUri = conf.backups.mongo.target.uri;
        if(!targetUri) {
          throw 'No target mongo URI';
        }

        var targetCollections = conf.backups.mongo.target.collections;
        if(!isArray(targetCollections)) {
          throw 'Target collections is not an Array';
        }

        var mongoTargetUriData = mongoUri.parse(targetUri);  

        var destDbCollection = db.collection(mongoDestCollection);

        // Mount S3 backup
        if(_.contains(storages, 's3')) {
          var awsConfig = conf.backups.aws;
          if(!awsConfig) {
            throw "No AWS config";
          }

          router.use('/backups', getS3BackupRouter(conf.backups.mongo.target,
                destDbCollection, conf.backups.aws));

          discoveryData.backups.s3 = {
            start: {
              route: '/backups/s3',
              methods: { post: true }
            },

            check: {
              route: '/backups/s3/:id',
              methods: { get: true }
            }
          };
        }

        router.get('/backups/list', function(req,res) {
          destDbCollection.find().toArray(function(err, docs) {
            res.send(docs) 
          });
        });

        router.get('/backups/list/:id', function(req, res) {
          var backupId = req.param('id');
          destDbCollection.findOne({backupId: backupId}, function(err, docs) {
            if(err) { throw err; }
            res.send(docs);
          });
        });

        discoveryData.backups.list = {
          all: {
            route: '/backups/list',
            method: { get: true }
          },

          one: {
            route: '/backups/list/:id',
            method: { get: true }
          }
        };

        router.get('/backups/restore/:id', function(req, res) {
          var backupId = req.param('id');
          destDbCollection.findOne({backupId: backupId}, function(err, docs) {
            if(err) { throw err; }
            var promises = _.map(docs.data, function(d) {
              return restoreBinaryFromUrl(d.url, mongoTargetUriData.database, d.collection);
            });

            q.all(promises)
              .then(function() {
                res.send('done'); //TODO better response?
              });
          });
        });

        router.get('/discovery', function(req, res) {
          res.send(discoveryData);
        });

        deferred.resolve(router);
      }
    }

  });


  return deferred.promise;
}

exports = module.exports = {

  getRouter: getAdminApiRouter,

  // Should I export this or configure it in getAdminApiRouter?
  getS3BackupRouter: getS3BackupRouter
};
