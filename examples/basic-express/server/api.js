/* global exports, require */

'use strict';

var koast = require('koast');
var connection = koast.getDatabaseConnectionNow();
var mapper = koast.makeMongoMapper(connection);

// Attaches conditions to queries.
mapper.queryDecorator = function(query, req, res) {
  // query.owner = 'luke';
};

function isOwner(req, result) {
  var username = req.user && req.user.data.username;
  return username && (result.data.owner === username);
}

// The actual routes.
exports.routes = [
  ['get', 'robots', mapper.get('robots', [])],
  ['get', 'robots/:robotNumber', mapper.get('robots', [], ['owner'])],
  ['del', 'robots/:robotNumber', mapper.del('robots')],
  ['put', 'robots/:robotNumber', mapper.put('robots')],
  ['post', 'robots', mapper.post('robots')]
];

exports.routes = [
  {
    method: 'get',
    route: 'robots',
    handler: mapper.get({
      model: 'robots',
      useEnvelope: true
    })
  },
  {
    method: 'get',
    route: 'robots/:robotNumber',
    queryDecorator: function (query, request, response) {
      query.owner = 'luke';
    },
    annotator: function(req, result, res) {
      if (isOwner(req, result)) {
        result.meta.can.edit = true;
***REMOVED***
    },
    handler: mapper.get({
      model: 'robots',
      useEnvelope: true
    })
  }
];