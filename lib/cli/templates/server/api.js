/* global exports, require */

'use strict';

var koast = require('koast');

exports.defaults = {};
exports.defaults.authorization = function defaultAuthorization(req, res) {
  return true;
};

exports.routes = [{
  method: 'get',
  route: 'koast',
  handler: function(req, res) {
    res.write('Koasting along.');
    res.end();
  }
}];
