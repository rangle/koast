var mds = require('mongodump-stream');
var knox = require('knox');
var q = require('q');

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