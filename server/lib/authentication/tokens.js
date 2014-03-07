/* global require, exports */

var crypto = require('crypto');

var fixedSalt = '0c@b2d:24+fe58cf';

exports.makeToken = function (userid, time, appSalt) {
  var shasum = crypto.createHash('sha1');
  var text = fixedSalt + appSalt + time + userid;
  shasum.update(text);

  return shasum.digest('base64');
};