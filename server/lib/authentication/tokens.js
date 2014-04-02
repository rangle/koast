/* global require, exports */

'use strict';

var crypto = require('crypto');

var fixedSalt = '0c@b2d:24+fe58cf';

exports.makeToken = function (userid, time, salt, secret) {
  var shasum = crypto.createHash('sha1');
  var text = fixedSalt + salt + time + userid + secret;
  shasum.update(text);

  return shasum.digest('base64');
};
