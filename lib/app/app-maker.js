/** @module lib/app/app-maker */
/* global require, exports, __dirname */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var Q = require('q');
var expect = require('chai').expect;
var _ = require('underscore');

var log = require('../log');
var authentication = require('../authentication/authentication');

var config = require('../config');
var koastRouter = require('../koast-router');


function mountApiModule(app, routeConfig, module) {
  var modulePath = process.cwd() + '/' + routeConfig.module;
  log.verbose('    Module path:', modulePath);
  var mod = require(modulePath);
  if (mod.routes) {
    log.warn(
      'export.routes will become deprecated. Please see documentation for more information.'
    );
    app.use(routeConfig.route, koastRouter(mod.routes, mod.defaults));
  } else if (mod.koastModule && mod.koastModule.router) {
    log.info('koastModule found: mounting router');
    app.use(routeConfig.route, mod.koastModule.router);
  }

}

function useCors(app, corsConfig) {
  var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', corsConfig.origin);
    res.header('Access-Control-Allow-Headers', corsConfig.headers);
    res.header('Access-Control-Allow-Methods', corsConfig.methods);
    res.header('Access-Control-Allow-Credentials', corsConfig.credentials);
    next();
  };
  app.use(allowCrossDomain);
}

/**
 * Sets up an app based on a configuration file.
 * @param {string} [newRole] The new role of the employee.
 */
exports.makeExpressApp = function () {

  var appConfig = config.getConfig('app', true);
  var corsConfig = config.getConfig('cors');
  var app = express();
  var indexHtml;


  // Use CORS if configured.
  if (corsConfig) {
    useCors(app, corsConfig);
  }

  // Load index.html.
  if (appConfig.indexHtml) {
    indexHtml = fs.readFileSync(appConfig.indexHtml).toString();
  }

  // Use body parser.
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  // Add handling of sessions

  authentication.addAuthMaintenance(app);

  // Enable LESS.
  if (appConfig.lessPaths) {
    var lessMiddleware = require('less-middleware');
    appConfig.lessPaths.forEach(function (pathConfig) {
      // pathConfig should be an array [<mountMount>, <path>].
      log.verbose('Enabling LESS conversion for %s mounted at %s.',
        pathConfig[1], pathConfig[0]);
      app.use(pathConfig[0], lessMiddleware({
        src: pathConfig[1]
      }));
    });
  }

  // Setting up top level routes
  if (appConfig.routes) {
    log.verbose('Adding routes:');
    appConfig.routes.forEach(function (routeConfig) {
      log.verbose('  Mounting %s route on %s.', routeConfig.type,
        routeConfig.route);

      if (routeConfig.route[0] !== '/') {
        log.warn('Route path does not start with a slash:', routeConfig.route);
      }

      if (routeConfig.type === 'static') {
        // Static is the easy case, let's handle it right here.
        app.use(routeConfig.route, express.static(routeConfig.path));
      } else if (routeConfig.type === 'module') {
        // An API module is more involved, so we call a function.
        mountApiModule(app, routeConfig, routeConfig.module);
      }
    });
  } else {
    log.verbose('No routes to add.');
  }

  // Add authentication routes
  authentication.addAuthenticationRoutes(app);
  app.use('/', koastRouter(authentication.routes, authentication
    .defaults));


  // Handle errors.
  app.use(function (err, req, res, next) {
    log.error(err);
    log.error(err.stack);
    if (req) {
      res.status(500).send({
        error: 'Something blew up!'
      });
    } else {
      next(err);
    }
  });

  // Setup the routes
  log.verbose('Set up some routes');

  // First the index file.
  if (indexHtml) {
    app.get('/', function (req, res) {
      res.status(200).send(indexHtml);
    });
  }

  // 404 for everything else.
  app.get('*', function (req, res) {
    res.status(404).send('Not found.');
  });

  log.verbose('Resolving the app');

  return app;
};
