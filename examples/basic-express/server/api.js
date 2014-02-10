/* global exports */

var koast = require('koast');
var connection = koast.getDatabaseConnectionNow();
console.log(koast);
var mapper = koast.makeMongoMapper(connection);

mapper.queryDecorator = function(query, req, res) {
  // query.owner = 'luke';
};

mapper.authorizer = function(result, req, res) {
  if (result.data.owner === 'luke') {
    result.meta.can.edit = true;
  }
}
// mapper.setAuthorizer(function)

exports.routes = [
  ['get', 'robots', mapper.get('robots', [])],
  ['get', 'robots/:robotNumber', mapper.get('robots')]
];