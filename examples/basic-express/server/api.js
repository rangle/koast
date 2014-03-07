/* global exports, require */

'use strict';

var koast = require('koast');
var connection = koast.getDatabaseConnectionNow();
var mapper = koast.makeMongoMapper(connection);

mapper.queryDecorator = function(query, req, res) {
  // query.owner = 'luke';
};

mapper.authorizer = function(result, req, res) {
  var username = req.user && req.user.username;
  if (username && (result.data.owner === username)) {
    result.meta.can.edit = true;
  }
};

exports.routes = [
  ['get', 'robots', mapper.get('robots', [])],
  ['get', 'robots/:robotNumber', mapper.get('robots'), ['robotNumber']],
  ['del', 'robots/:robotNumber', mapper.del('robots'), ['robotNumber']],
  ['put', 'robots/:robotNumber', mapper.put('robots'), ['robotNumber']],
  ['post', 'robots', mapper.post('robots')]
];