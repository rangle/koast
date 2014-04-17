/* global require, exports */

'use strict';

var _ = require('underscore');
var passport = require('passport');
***REMOVED***
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(express);

***REMOVED***
var log = require('../log');
var oauth = require('./oauth');
var password = require('./password');
var util = require('../util/util');
var dbUtils = require('../database/dbUtils');

/**
 * Sets up session handling for the app.
 * @param {Object} app             An express app.
 */
exports.addSessionHandling = function (app) {
  var connection = dbUtils.getConnectionNow();

  var sessionStore = new MongoStore({
    db: connection.db
***REMOVED***

  app.use(express.cookieParser()); //appConfig.authentication.cookieSecret));
  app.use(express.session({
    secret: '076ad5894a80f20e70b1e3ab0e4686b5',
    maxAge: 3600000, // 1 hour
    store: sessionStore
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
***REMOVED***

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
***REMOVED***
};

/**
 * Adds routes for authentication and related things.
 * @param {Object} app             An express app.
 */
exports.addAuthenticationRoutes = function (app) {
  var authConfig = config.getConfig('authentication');
  var oauthConfig = config.getConfig('oauth');
  var connection = dbUtils.getConnectionNow();
  var providerAccounts = connection.model('userProviderAccounts');
  var users = connection.model('users');

  // GET /auth/user - returns info about the logged in user, in an envelope.
  app.get('/auth/user', function (req, res) {
    res.send(200, req.user);
***REMOVED***

  // PUT /auth/user - update the current user's record. This is meant to be
  // used for the purpose of registration, etc. For now we only allow this
  // method to set username. This is currently working only for OAuth users.
  app.put('/auth/user', function (req, res) {
    var query;
    var update;

    // Check if the user is actually logged in. We should try to update info
    // for an anonymous user.
    if (!(req.user && req.user.data)) {
      log.error('no user or no user data');
      res.send(500, 'Internal error');
      return;
    }

    // For right now, we do not allow the user to change their username if it
    // has been set before.
    if (req.user.username) {
      res.send(401, 'You cannot change the user name of a registered user.');
      return;
    }

    // Setup and execute an update query.
    query = {
      provider: req.user.data.provider,
      idWithProvider: req.user.data.idWithProvider
***REMOVED***
    update = {
      username: req.body.username
***REMOVED***
    providerAccounts.update(query, update).exec()
      .then(function () {
        // Now we need to update user's data in the session. The simplest way
        // to do that is to first get the current user's data.
        return oauth.getUserFromProfile(providerAccounts, req.user.data)
          .then(function (userRecord) {
            if (!userRecord) {
              throw new Error('Could not get user record.');
***REMOVED***
            // Once we have the userRecord, we try to update the session.
            req.login(userRecord, function (error) {
              if (error) {
                throw error;
  ***REMOVED*** else {
                res.send(200, 'Ok');
  ***REMOVED***
        ***REMOVED***
      ***REMOVED***
***REMOVED***)
      .then(null, util.makeErrorResponder(res));
***REMOVED***

  // POST /auth/logout - logs out the user.
  app.post('/auth/logout', function (req, res) {
    req.logout();
    res.send(200, 'Ok');
***REMOVED***

  // GET /auth/usernameAvailable - checks if a username is available.
  app.get('/auth/usernameAvailable', function (req, res) {
    if (!req.query.username) {
      res.send(400, 'Please provide a username');
    }
    var query = {
      username: req.query.username
***REMOVED***
    providerAccounts.find(query).exec()
      .then(function (matchingUsers) {
        res.send(200, matchingUsers.length === 0);
***REMOVED***)
      .then(null, util.makeErrorResponder(res));
***REMOVED***

  // For now configure this regardless of authentication config, for backwards
  // compatibility.
  if (oauthConfig) {
    log.info('Adding OAuth routes');
    // Finally, use oauth.init to setup routes for all configured providers.
    _.keys(oauthConfig).forEach(function (provider) {
      oauth.init(app, provider, oauthConfig[provider], providerAccounts);
***REMOVED***
  }

  // Configure password authentication if necessary.
  console.log('Authentication strategy:', authConfig.strategy);
  if (authConfig.strategy === 'password') {
    password.setup(app, users, {***REMOVED***
  }
}