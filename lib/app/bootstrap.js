'use strict';

var express = require('express');
var rek = require('rekuire');

var bootstrap = {};

function loadApiModule(app, routePath, name) {
  var mod = rek(name).koastModule;
  app.use(routePath, mod.router);
}

function loadStaticModule(app, routePath, filePath) {
  app.use(routePath, express.static(filePath));
}

bootstrap.getConfiguredApplication = function(appConfig) {
  //appConfig = appConfig || loadAppConfig();
  var app = express();

  appConfig.routes.forEach(function(routeDef) {
    if(routeDef.type === 'module') {
      loadApiModule(app, routeDef.route, routeDef.module);
    } else if(routeDef.type === 'static') {
      loadStaticModule(app, routeDef.route, routeDef.path);
    }
  });

  return app;
};

module.exports = exports = bootstrap;
