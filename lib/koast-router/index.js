/** @module koast/koast-router */
/* jshint expr:true */
/* global require, exports */

'use strict';


var Router = require('express').Router;
var log = require('../log');
var _ = require('underscore');

function assertSubrouteField(subroute, fieldName) {

  if (!subroute[fieldName]) {
    throw new Error('Error processing field ' + fieldName + ' in subroute.');
  }
}

function getAuthorizationMiddleware(authFunction) {
  return function (req, res, next) {
    var authDecision = authFunction(req, res);
    if (authDecision !== true) {
      res.setHeader('Content-Type', 'application/json');
      res.status(401).send({
        errorCode: 'not-authorized',
        displayMessage: 'Not authorized'
  ***REMOVED***
    } else {
      next();
    }
  };
}

function generateRoute(route, router, options) {


  var koastRoute;
  var path;
  var authFunction = route.authorization || options.authorization;
  var handler = route.handler;
  var methods;

  assertSubrouteField(route, 'method');
  assertSubrouteField(route, 'route');
  assertSubrouteField(route, 'handler');

  path = '/' + route.route;
  koastRoute = router.route(path);
  log.verbose('    Subroute:', route.method, path);

  if (path.search('//') > 0) {
    log.warn('API endpoint path contains a double slash:', path);
  }

  // Figure out if we are mapping a single method or multiple methods.
  if (typeof route.method === 'string') {
    methods = [route.method];
  } else if (_.isArray(route.method)) {
    methods = route.method;
  } else {
    throw new Error(
      'Field "method" should be set either set either to a method name or an array of method names.'
    );
  }

  // Now let's iterate over the different methods.
  koastRoute.all(getAuthorizationMiddleware(authFunction));
  methods.forEach(function (method) {


    if (route.handler.isMiddlewareFactory) {
      handler = route.handler({
        method: method
  ***REMOVED***

    } else {

      handler = route.handler;
    }
    koastRoute[method](handler);


***REMOVED***

  return koastRoute;
}


/**
 * Generate an express 4 router based on an array of routes
 * @function koastRouter
 * @param {array} routes - array containing the route definition
 * @param {object} [options] - router options containing default authorization
 * @param {Router} [router] - Express 4 router to mount routes onto, if not
 * provided will return a new router.
 * @example
 * var routes = [{
 *  method: ['get', 'put'],
 *  route: 'tasksx/:_id',
 * handler: mapper.auto({
 *  model: 'tasks'
 *   })
 * }];
 * var app = express();
 * var defaults = { authorization: function(req,res) { return true; } }
 * var router = koastRouter(routes,defaults);
 * app.use('/',router);
 */
module.exports =
  function koastRouter(routes, options, router) {
    var options = options || {};
    options.authorization = options.authorization || function (req, res) {
      return true;
    }

    if (!_.isArray(routes)) {
      throw new Error("koastRouter expects first paramater to be an array");
    }


    var router = router || Router();
    routes.forEach(function (route) {
      generateRoute(route, router, options);

***REMOVED***
    return router;
}
