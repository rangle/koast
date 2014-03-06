/* global exports */

var koast = require('koast');
var connection = koast.getDatabaseConnectionNow();
console.log(koast);
var mapper = koast.makeMongoMapper(connection);

mapper.queryDecorator = function(query, req, res) {
  // query.owner = 'luke';
};

mapper.authorizer = function(result, req, res) {
  var username = req.user && req.user.username;
  console.log('user:', username || 'anonymous');
  if (username && (result.data.owner === username)) {
    result.meta.can.edit = true;
  }
}
// mapper.setAuthorizer(function)

exports.routes = [
  ['get', 'robots', mapper.get('robots', [])],
  ['get', 'robots/:robotNumber', mapper.get('robots')],
  ['put', 'robots/:robotNumber', mapper.put('robots', ['robotNumber'])],
];