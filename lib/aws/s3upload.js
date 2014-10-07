/** @module koast/aws */
/* global exports, require */

'use strict';

var fs = require('fs');

/**
 * TODO
 *
 * @param {Object} options TODO
 */
exports.makeS3FileUploader = function (awsOpts, s3opts) {

  var AWS;
  var s3;

  try {
    AWS = require('aws-sdk');

    // Add properties of awsOpts to AWS.config
    AWS.config.update(awsOpts);

    s3 = new AWS.S3();
  } catch (e) {
    throw e;
  }

  return function (req, res) {

    var file = req.files.attachments;

    var key = s3opts.makeKey(req);
    var params = {
      Bucket: s3opts.bucket,
      Key: key,
      Body: fs.createReadStream(file.path),
      ACL: s3opts.acl,
      ContentType: file.mimetype
    };

    s3.putObject(params, function (err) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        s3opts.respond(req, res, key);
      }
    });

  };
};
