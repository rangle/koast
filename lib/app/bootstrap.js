***REMOVED***
var rek = require('rekuire');

var bootstrap = {};

bootstrap.getConfiguredApplication = function(appConfig) {
  //appConfig = appConfig || loadAppConfig();
  var app = express();

  appConfig.routes.forEach(function(routeDef) {
    if(routeDef.type === 'module') {
      var mod = rek(routeDef.module).koastModule;
      app.use(routeDef.route, mod.router);
    }
***REMOVED***

  return app;
};

module.exports = exports = bootstrap;
