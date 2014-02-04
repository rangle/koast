var koast = require('koast');
koast.setEnvironment('local');


var appConfig = koast.getConfig('app');
var dbConfig = koast.getConfig('database');
var log = koast.getLogger();
var schemas = require('./schemas').schemas;

koast.createDatabaseConnection(dbConfig, schemas)
  // Optionally insert extra steps here before setting up the app.
  .then(function(connection) {
    var app = koast.makeExpressApp(appConfig);
    app.listen(appConfig.portNumber);
    log.info('Listening on ', appConfig.portNumber);
  })
  .fail(function (reason) {
    console.log('Error:', reason);
***REMOVED***