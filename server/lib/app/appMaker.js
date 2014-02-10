/* global require, exports, __dirname */

'use strict';

***REMOVED***
var fs = require('fs');
var log = require('../log');

exports.makeExpressApp = function (appConfig) {

  var app = express();
  var indexHtml;

  if (appConfig.indexHtml) {
    indexHtml = fs.readFileSync(appConfig.indexHtml).toString();
  }

  app.use(express.bodyParser());
  // authentication.apply(app, 'api/');

  // Enable LESS.
  if (appConfig.lessPaths) {
    var lessMiddleware = require('less-middleware');
    appConfig.lessPaths.forEach(function (pathConfig) {
      // pathConfig should be an array [<mountMount>, <path>].
      log.verbose('Enabling LESS conversion for %s mounted at %s.',
        pathConfig[1], pathConfig[0]);
      app.use(pathConfig[0], lessMiddleware({
        src: pathConfig[1]
***REMOVED***));
***REMOVED***
  }

  // Setting up top level routes
  if (appConfig.routes) {
    log.verbose('Adding routes.');
    appConfig.routes.forEach(function (routeConfig) {
      log.verbose('    Monting %s route on %s.', routeConfig.type,
        routeConfig.route);
      if (routeConfig.type === 'static') {
        app.use(routeConfig.route, express.static(routeConfig.path));
***REMOVED*** else if (routeConfig.type === 'module') {
        var modulePath = process.cwd() + '/' + routeConfig.module;
        log.verbose('Module path:', modulePath);
        var module = require(modulePath);
        var subRoutes = module.routes;
        subRoutes.forEach(function (subRoute) {
          log.verbose('Mounting on %s: ', routeConfig.route, subRoute);
          var method = subRoute[0];
          var path = routeConfig.route + '/' + subRoute[1];
          var handler = subRoute[2];
          app[method](path, handler);
    ***REMOVED***
***REMOVED***
***REMOVED***
  } else {
    log.verbose('No routes to add.');
  }

  // Handle errors.
  app.use(function (err, req, res, next) {
    log.error(err);
    log.error(err.stack);
    if (req) {
      res.send(500, {
        error: 'Something blew up!'
  ***REMOVED***
    } else {
      next(err);
    }
***REMOVED***

  // authentication.setupRoutes(app, '/api/oauth/');
  // apiRoutes.setupApiRoutes(app, '/api/');

  log.verbose('Set up some routes');

  if (indexHtml) {
    app.get('/', function (req, res) {
      res.send(202, indexHtml);
***REMOVED***
  }

  // 404 for everything else.
  app.get('*', function (req, res) {
    res.send(404, 'Not found.');
***REMOVED***

  log.verbose('Resolving the app');
  return app;
};
