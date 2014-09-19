/** @module lib/authentication/maintenance */
/* global require, exports */

'use strict';

// Adds support for two different strategies for maintaining user
// authentication between requests: session cookies and JWT tokens.

var passport = require('passport');
***REMOVED***
var session = require('express-session');
var cookieParser = require('cookie-parser');
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(session);
var expressJwt = require('express-jwt');

***REMOVED***
var log = require('../log');
var dbUtils = require('../database/db-utils');

// Adds the handling of Json Web Tokens. If a request comes with a JWT, we set
// the user accordingly. Improper or expired JWT results in a 401. If no JWT
// is submitted, however, we let this through, just without setting the user
// field on the request.
function addJwtHandling(app) {
  var secrets = config.getConfig('secrets');
  if (!secrets.authTokenSecret) {
    log.error('Cannot setup token authentication because token secret is not configured.');
    return;
  }
  app.use(expressJwt({secret: secrets.authTokenSecret}));
  app.use(function (req, res, next) {
    if (req.user && req.user.data) {
      req.user.isAuthenticated = true;
      req.user.meta = req.user.meta || {};
    }
    next();
***REMOVED***
  app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      if (err.code === 'credentials_required') {
        // If the caller did not provide credentials, we'll just consider this
        // an unauthenticated request.
        next();
***REMOVED*** else {
        res.status(401).send('Invalid token: ' + err.message);
***REMOVED***
    }
***REMOVED***
}

// Adds the handling of session cookies.
function addSessionHandling (app, config) {
  var connection = dbUtils.getConnectionNow();

  var sessionStore = new MongoStore({
    db: connection.db
***REMOVED***

  app.use(cookieParser());
  app.use(session({
    secret: '076ad5894a80f20e70b1e3ab0e4686b5',
    maxAge: 3600000, // 1 hour
    store: sessionStore
  }));

  app.use(passport.initialize());
  exports.usingSessions = true;
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
***REMOVED***

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
***REMOVED***
};

/**
 * Adds authentication maintenance middleware, either using cookies or JTW
 * tokens.
 *
 * @param {Object} app       The express app.
 */
exports.addAuthMaintenance = function(app) {
  var authConfig = config.getConfig('authentication');
  if (authConfig.maintenance==='cookie') {
    addSessionHandling(app);
  } else if (authConfig.maintenance==='token') {
    addJwtHandling(app);
  } else {
    log.warn('Invalid "maintenance" option in authentication configuration:',
      authConfig.maintenance, '(Valid options: "cookie", "token".)');
  }
};
