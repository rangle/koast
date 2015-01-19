var mds = require('mongodump-stream');
var knox = require('knox');
var q = require('q');
var fs = require('fs');
var log = require('../../log');

// S3 handler

exports.genS3BackupHandler = function (awsKey, awsSecret) {
  return {
    store: function (stream, opts) {
      var bucket = opts.bucket;
      var key = opts.name;

      return mds.dump.s3( //FIXME mongodump-stream doesn't actually post empty streams but still resolves
          key,
          stream, {
            key: awsKey,
            objectName: opts.name,
            secret: awsSecret,
            bucket: bucket
          }
        )
        .thenResolve({
          key: key,
          bucket: bucket
        });
    },

    restore: function (receipt) {
      var client = knox.createClient({
        key: awsKey,
        secret: awsSecret,
        bucket: receipt.bucket
      });
      return q.nbind(client.getFile, client)(receipt.key);
    },

    destroy: function (receipt) {
      var client = knox.createClient({
        key: awsKey,
        secret: awsSecret,
        bucket: receipt.bucket
      });
      return q.nbind(client.deleteFile, client)(receipt.key);
    }
  };
}

exports.filesystemBackupHandler = function(basePath) {
  q.nbind(fs.mkdir)(basePath)
    .then(function() {
      log.info(basePath, ' created for local backup storage')
    })
    .then(null, function (err) {
      if (err.code !== 'EEXIST') {
        log.error(err);
        throw err;
      }
    });

  return {
    _getPath: function (name, collection) {
      var stripped = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
      return [
        basePath,
        stripped,
        collection,
        new Date().toISOString(),
        '.bson'
      ].join('');
    },
    store: function (stream, opts) {
      var path = this._getPath(opts.name, opts.collection);
      return mds.dump.fs.file(stream, path)
        .thenResolve({
          key: opts.name,
          filepath: path
        });
    },
    restore: function (receipt) {
      return q.when(fs.createReadStream(receipt.filepath));
    },
    destroy: function (receipt) {
      return q.nbind(fs.unlink)(receipt.filepath);
    }
  };
}