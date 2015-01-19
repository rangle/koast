'use strict';

/* global require, console */
var q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var mds = require('mongodump-stream');
var MongoClient = require('mongodb').MongoClient;
var MongoUri = require('mongo-uri');
var R = require('ramda');
var sprawn = require('sprawn');
var util = require('../../util/util');

var log = require('../../log');


var handlers = {};

// Handlers consume and store a stream producing a receipt which can then 
// be used to manipulate the stored instance of the data. Each handler must
// expose the follow methods:
//
//  - store - Consumes stream, produces a promise which resolves to the receipt
//  - retrieve - Consumes a receipt produced by store and returns a stream corresponding to the original data
//  - destroy - Consumes a receipt and deletes the data.

function registerHandler(type, handler) {
  if (handler[type]) {
    throw new Error('Attempted to define handler for ' + type + ' twice');
  }

  handlers[type] = handler;
}

// TODO Ideally the handler should be an event emitter which sends progress
// updates, for now we just use promises (fix this soon to keep the
// interface consistent.) The handler must also return a receipt which can
// be used by the handler's restore method to return a stream corresponding 
// to the one stored. 
//
// Return a promise which resolves to a backup entry once all collections
// have been persisted by the appropriate handler.

// A backup record is of the following form
// {
//  id: <type>
//  type: <collectionName>
//  receipts: <handlerReceipt>
// }
//
// A receipt is of the following form
// {
//  collection: 'The name of the collection associated with the receipt'
//  data: 'The handler payload (i.e the actual receipt)'
// }
// collection associated with the receipt and the receipt payload itself in
// the data attribute key.

function createBackup(mongoUri, collections, type, opts) {
  //TODO make assertions on parameters
  if (!(collections instanceof Array))
    collections = [collections];

  var handler = getHandler(type);

  var successfulBackups = [];
  var backupCollections = R.map(function (collection) {
    var stream = mds.slurp.binary(mongoUri, collection);
    opts.collection = collection;
    return handler.store(stream, opts)
      .then(function (handlerReceipt) {
        successfulBackups.push(handlerReceipt); //Yuck
        return {
          collection: collection,
          data: handlerReceipt
        };
      });
  });

  var backups = backupCollections(collections);

  return q.all(backups)
    .then(function (receipts) {
      return {
        type: type,
        receipts: receipts
      };
    })
    .then(null, function (err) {
      q.allSettled(backups)
        .then(function () {
          successfulBackups.forEach(function (r) { //Rollback changes (figure out a more intelligent way of doing this)
            handlers[type].destroy(r);
          });
        });
      throw err; //FIXME
    });
}


// Consumes a backupRecord produced by createBackup and a mongoUri and restores
// the information contained in the record to the database described the
// mongoUri.

function restoreBackup(backupRecord, mongoUri) {
  var receipts = backupRecord.receipts;
  var handler = getHandler(backupRecord.type);

  var restorePromises = receipts.map(function (receipt) {
    var tmpfile = util.getTempFileName() + '.bson';
    return R.pPipe(
      handler.restore.bind(handler),
      R.curry(R.flip(mds.dump.fs.file))(tmpfile),
      R.curryN(4, mongoRestoreFromFile)(tmpfile, mongoUri, receipt.collection)
    )(receipt.data);
  });

  return q.all(restorePromises).thenResolve('done');
};


exports = module.exports = {
  create: createBackup,
  restore: restoreBackup,
  registerHandler: registerHandler
};

//Util
//=================================================================================

//FIXME handle authentication and multiple hosts, and move into mongodump-stream
function mongoRestoreFromFile(dumpFile, mongoUri, targetCollection) {
  var uriData = MongoUri.parse(mongoUri);
  var cmd = 'mongorestore';
  var args = ['-h', uriData.hosts[0], '--db', uriData.database, '--collection', targetCollection, dumpFile];

  return sprawn.resolve(cmd, args);
}

function getHandler(type) {
  if (!handlers[type]) {
    throw new Error('Handler for type ' + type + ' does not exist');
  }

  return handlers[type];
}

