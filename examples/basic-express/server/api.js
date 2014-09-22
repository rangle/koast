/* global exports, require */

'use strict';

var koast = require('koast');
var connection = koast.db.getConnectionNow();
var mapper = koast.mongoMapper.makeMapper(connection);

exports.defaults = {};
exports.defaults.authorization = function defaultAuthorization(req, res) {
  return true;
};


function isOwner(req, result) {
  var username = req.user && req.user.data.username;
  return username && (result.data.owner === username);
}

mapper.options.useEnvelope = true;

function robotAnnotator (req, result, res) {
  if (isOwner(req, result)) {
    result.meta.can.edit = true;
  }
};

function robotQueryDecorator (query, request, response) {
  // query.owner = 'luke';
};

exports.routes = [
  {
    method: 'get',
    route: 'robots',
    handler: mapper.get({
      model: 'robots',
      queryDecorator: robotQueryDecorator,
      annotator: robotAnnotator
    })
  },
  {
    method: 'get',
    route: 'robots/:robotNumber',
    handler: mapper.get({
      model: 'robots',
      optionalQueryFields: ['owner'],
      // queryDecorator: robotQueryDecorator,
      annotator: robotAnnotator
    })
  },
  {
    method: 'del',
    route: 'robots/:robotNumber',
    handler: mapper.del('robots')
  },
  {
    method: 'put',
    route: 'robots/:robotNumber',
    handler: mapper.put('robots')
  },
  {
    method: 'post',
    route: 'robots',
    handler: mapper.post('robots')
  }
];
