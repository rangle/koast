/* global exports, require */

'use strict';

var koast = require('koast');
var connection = koast.getDatabaseConnectionNow();
var mapper = koast.makeMongoMapper(connection);

// Attaches conditions to queries.
mapper.queryDecorator = function(query, req, res) {
  // query.owner = 'luke';
};

// Annotates the results with authorization information.
mapper.authorizer = function(result, req, res) {
  var username = req.user && req.user.data.username;
  if (username && (result.data.owner === username)) {
    result.meta.can.edit = true;
  }
};

// The actual routes.
exports.routes = [
  ['get', 'robots', mapper.get('robots', [])],
  ['get', 'robots/:robotNumber', mapper.get('robots', [], ['owner'])],
  ['del', 'robots/:robotNumber', mapper.del('robots')],
  ['put', 'robots/:robotNumber', mapper.put('robots')],
  ['post', 'robots', mapper.post('robots')]
];