/* global exports, require */

'use strict';

var fs = require('fs');

exports.makeS3FileUploader = function (options) {

  var AWS;
  var s3;

  try {
    AWS = require('aws-sdk');
    AWS.config.loadFromPath(options.configFile);
    s3 = new AWS.S3();
  } catch (e) {
    throw e;
  }

  return function (req, res) {
    var file = req.files.attachment.file;
    var key = options.makeKey(req);
    var params = {
      Bucket: options.bucket,
      Key: key,
      Body: fs.createReadStream(req.files.attachment.file.path),
      ACL: options.acl,
      ContentType: file.type
***REMOVED***
    console.log('S3 Params:', params);
    s3.putObject(params, function (err) {
      if (err) {
        throw err;
***REMOVED*** else {
        options.respond(req, res, key);
***REMOVED***
***REMOVED***
  };
};