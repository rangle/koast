console.log('...');

var koast = require('koast');
koast.setEnvironment('local');

var appConfig = koast.getConfig('app');
var log = koast.getLogger();

koast.createDatabaseConnections()
  // Optionally insert extra steps here before setting up the app.
  .then(function() {
    var app = koast.makeExpressApp();
    app.listen(appConfig.portNumber);
    log.info('Listening on ', appConfig.portNumber);
  })
  .fail(function (reason) {
    console.log('Error:', reason);
***REMOVED***