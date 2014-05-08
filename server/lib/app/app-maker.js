/* global require, exports, __dirname */

'use strict';

***REMOVED***
var fs = require('fs');
var Q = require('q');

var log = require('../log');
var authentication = require('../authentication/authentication');

***REMOVED***

// Sets up an app based on a configuration file.
exports.makeExpressApp = function () {

  var appConfig = config.getConfig('app');
  var corsConfig = config.getConfig('cors');

  var app = express();
  var indexHtml;

  if (corsConfig) {
    var allowCrossDomain = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', corsConfig.origin);
      res.header('Access-Control-Allow-Headers', corsConfig.headers);
      res.header('Access-Control-Allow-Methods', corsConfig.methods);
      res.header('Access-Control-Allow-Credentials', corsConfig.credentials);
      next();
***REMOVED***
    app.use(allowCrossDomain);
  }

  if (appConfig.indexHtml) {
    indexHtml = fs.readFileSync(appConfig.indexHtml).toString();
  }

  app.use(express.bodyParser());

  // Add handling of sessions
  authentication.addSessionHandling(app);

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
          var method = subRoute[0];
          var path = routeConfig.route + '/' + subRoute[1];
          var handler = subRoute[2];
          // app[method](path, function (req, res, next) {
          //   var userJson = req.headers['koast-user'];
          //   if (userJson) {
          //     // Not checking the validity of auth tokens for now!
          //     req.user = JSON.parse(userJson);
          //   }
          //   next();
          // ***REMOVED***
          app[method](path, handler);
    ***REMOVED***
***REMOVED***
***REMOVED***
  } else {
    log.verbose('No routes to add.');
  }

  // Add authentication routes
  authentication.addAuthenticationRoutes(app);

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

  // Setup the routes
  log.verbose('Set up some routes');

  // First the index file.
  if (indexHtml) {
    app.get('/', function (req, res) {
      res.send(200, indexHtml);
***REMOVED***
  }

  // 404 for everything else.
  app.get('*', function (req, res) {
    res.send(404, 'Not found.');
***REMOVED***

  log.verbose('Resolving the app');
  return app;
};