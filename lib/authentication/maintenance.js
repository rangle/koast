/** @module lib/authentication/maintenance */
/* global require, exports */

'use strict';

// Adds support for two different strategies for maintaining user
// authentication between requests: session cookies and JWT tokens.

var passport = require('passport');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(session);
var expressJwt = require('express-jwt');

var config = require('../config');
var log = require('../log');
var dbUtils = require('../database/db-utils');

// Adds the handling of Json Web Tokens. If a request comes with a JWT, we set
// the user accordingly. Improper or expired JWT results in a 401. If no JWT
// is submitted, however, we let this through, just without setting the user
// field on the request.
function addJwtHandling(secrets, app) {

  if (!secrets.authTokenSecret) {
    log.error(
      'Cannot setup token authentication because token secret is not configured.'
    );
    return;
  }
  app.use(expressJwt({
    secret: secrets.authTokenSecret
  }));
  app.use(function (req, res, next) {
    if (req.user && req.user.data) {
      req.user.isAuthenticated = true;
      req.user.meta = req.user.meta || {};
    }
    next();
  });
  app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      if (err.code === 'credentials_required') {
        // If the caller did not provide credentials, we'll just consider this
        // an unauthenticated request.
        next();
      } else {
        res.status(401).send('Invalid token: ' + err.message);
      }
    }
  });
}

// Adds the handling of session cookies.
function addSessionHandling(secrets, app) {
  var connection = dbUtils.getConnectionNow();

  var sessionStore = new MongoStore({
    db: connection.db
  });

  app.use(cookieParser());
  app.use(session({
    secret: secrets.cookieSecret,
    maxAge: 3600000, // 1 hour
    store: sessionStore
  }));

  app.use(passport.initialize());
  exports.usingSessions = true;
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });
}

function assertConfigurationKey(config, keyName) {
  if (typeof config[keyName] === 'undefined') {
    throw new Error('Maintenace Configuration requires:' + keyName);
  }
}

function assertCookieConfig() {

  return assertConfigurationKey(config.getConfig('secrets'),
    'cookieSecret');
}

function assertAuthConfig() {
    return assertConfigurationKey(config.getConfig('secrets'),
      'authTokenSecret');
  }
  /**
   * Adds authentication maintenance middleware, either using cookies or JTW
   * tokens.
   *
   * @param {Object} app       The express app.
   */
exports.addAuthMaintenance = function (app) {
  var authConfig = config.getConfig('authentication');
  var secrets = config.getConfig('secrets');

  if (authConfig.maintenance === 'cookie') {

    assertCookieConfig();
    log.info('Cookies Setup, adding session handling');
    addSessionHandling(secrets, app);

  } else if (authConfig.maintenance === 'token') {

    assertAuthConfig();
    log.info('Tokens setup, adding jwt handling');
    addJwtHandling(secrets, app);

  } else if (authConfig.maintenance === 'disabled') {

    log.info('Maintenance is disabled. Not setting up maintenance');

  } else {

    log.warn(
      'Invalid "maintenance" option in authentication configuration:',
      authConfig.maintenance,
      '(Valid options: "cookie", "token","disabled")');
  }
};