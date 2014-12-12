/* global require, console */

'use strict';

var q = require('q');
var _ = require('underscore');
var express = require('express');
var backup = require('./backup/backup');
var mds = require('mongodump-stream');

function collectionToS3(collectionName, key, stream, awsGlobal, awsS3) {
  return mds.dump.s3(key, stream, {
    key: awsGlobal.accessKeyId,
    secret: awsGlobal.secretAccessKey,
    bucket: awsS3.bucket
  }).then(function(res) {
    console.log(res);
    return {collection: collectionName,
            url: res.Location}; // TODO
  });
}

function allCollectionsToS3(mongoUri, collections, awsGlobal, awsS3) {
  console.log('outit');

  return function(backupId, start) {
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

      stream.pipe(process.stdout);

      // return promise and resolve location
      return collectionToS3(coll, key, stream, awsGlobal, awsS3);
    }).then(function(data) {
      //backup to mongo hurr
      console.log('backup to mongo', data);
      return data;
    });
  };
}

function getS3BackupRouter(target, dest, awsConfig) {
  var router = express.Router();

  router.post('/s3', backup.initiateBackupHandler(
        allCollectionsToS3(target.uri, target.collections,
          awsConfig.global, awsConfig.s3)));

  router.get('/s3/:backupId', backup.retrieveBackupStatus);

  return router;
}

function isArray(val) {
  return val.constructor === Array;
}

/**
 * cb should return a promise that resolves when it's done
 */
function getAdminApiRouter(conf) {
  
  var router = express.Router();

  if(!conf.backups.mongo.dest) {
    throw 'No destination mongo config present';
  }

  var mongoDestUri = conf.backups.mongo.dest.uri;
  var mongoDestCollection = conf.backups.mongo.dest.collection;

  if(conf.backups) {
    if(conf.backups.storage) {
  
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

      // Mount S3 backup
      if(_.contains(storages, 's3')) {
        var awsConfig = conf.backups.aws;
        if(!awsConfig) {
          throw "No AWS config";
        }

        router.use('/backups', getS3BackupRouter(conf.backups.mongo.target,
              null, conf.backups.aws));
      }

    }
  }

  return router;

  /*
  var apiMeta = {};

  var register = function(apiModule) {
    var mount = apiModule.mount || '/';
    router.use(mount, apiModule.router);

    var pathMeta = _.map(apiModule.router.stack, function(r) {
      var route = r.route;
      
      return {
        path: mount + route.path,
        methods: route.methods,
      }
    });

    apiMeta[apiModule.name] = {
      type: apiModule.type,
      paths: pathMeta
    };
  };

  return cb(register).then(function() {

    router.get('/discovery', function(req, res) {
      res.send(apiMeta);
    });

    return router;
  });
  */
}

exports = module.exports = {

  getRouter: getAdminApiRouter,

  // Should I export this or configure it in getAdminApiRouter?
  getS3BackupRouter: getS3BackupRouter
};
