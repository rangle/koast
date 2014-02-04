/* global exports */

var koast = require('koast');
var connection = koast.getDatabaseConnection();

exports.routes = [
  ['get', 'robots', koast.makeMongoMapper(connection, 'robots')]
];