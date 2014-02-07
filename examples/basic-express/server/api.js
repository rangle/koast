/* global exports */

var koast = require('koast');
var connection = koast.getDatabaseConnectionNow();
console.log(koast);
var mapper = koast.makeMongoMapper(connection);

exports.routes = [
  ['get', 'robots', mapper.get('robots')],
  ['get', 'robots/:robotNumber', mapper.get('robots')]
];