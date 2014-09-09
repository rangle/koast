/* global require, exports */

'use strict';

var _ = require('underscore');
var jwt = require('jsonwebtoken');

***REMOVED***
var log = require('../log');
var oauth = require('./oauth');
var passwordAuth = require('./password');
var authMaintenance = require('./maintenance');
var util = require('../util/util');
var dbUtils = require('../database/db-utils');

// Just re-export the method from the child module.
exports.addAuthMaintenance = authMaintenance.addAuthMaintenance;

/**
 * Adds routes for authentication and related things.
 *
 * @param {Object} app             An express app.
 */
exports.addAuthenticationRoutes = function (app) {
  var authConfig = config.getConfig('authentication');
  var oauthConfig = config.getConfig('oauth');
  var connection = dbUtils.getConnectionNow();
  var providerAccounts = connection.model('userProviderAccounts');
  var users = connection.model('users');
  var secrets = config.getConfig('secrets');

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
      res.send(401, 'Not authenticated');
      return;
    }

    // For right now, we do not allow the user to change their username if it
    // has been set before.
    if (req.user.username) {
      res.send(422, 'You cannot change the user name of a registered user.');
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

  // POST /auth/user - Add (register) a new user
  app.post('/auth/user', function (req, res) {

    if (!req.body.username || !req.body.password || !req.body.displayName || !req.body.email) {
      res.send(422, 'You must provide username, email, and password');
      return;
    }

    var user = new users(req.body);
    // user.displayName = req.body.displayName;
    // user.username = req.body.username;
    // user.email = req.body.email;
    // if(req.body.userdata_id) {
    //   // This is a hack, needs to be removed. #todo
    //   user.userdata_id = req.body.userdata_id;
    // }

    passwordAuth.saveUser(user, req.body.password)
      .then(function(user) {
        if (user) {
          log.info('New user saved to the database:', user.username);
          res.send(200, user);
***REMOVED***
***REMOVED*** function(err) {
        if (err && err.code === 11000) {
          // code 11000 is a mongoose code for duplicate key error
          log.error('Could not save user. Is username and email unique? ' + err.message);
          return res.send(422, 'Username already exists.');
***REMOVED*** else {
          throw err;
***REMOVED***
***REMOVED***)
      .then(null, function(err) {
        log.error(err.message);
        return res.send(500, 'Internal error');
  ***REMOVED***
***REMOVED***

  // POST /auth/logout - logs out the user.
  app.post('/auth/logout', function (req, res) {
    if (authMaintenance.usingSessions) {
      req.logout();
    }
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

    var userCollection = authConfig.strategy === 'password' ? users : providerAccounts;
    userCollection.find(query).exec()
      .then(function (matchingUsers) {
        res.send(200, matchingUsers.length === 0);
***REMOVED***)
      .then(null, util.makeErrorResponder(res));
***REMOVED***

  // For now configure this regardless of authentication config, for backwards
  // compatibility.
  if (oauthConfig) {
    log.verbose('Adding OAuth routes');
    // Finally, use oauth.init to setup routes for all configured providers.
    _.keys(oauthConfig).forEach(function (provider) {
      oauth.init(app, provider, oauthConfig[provider], providerAccounts);
***REMOVED***
  }

  function getExpirationTime(offsetInMinutes) {
    var now = new Date();
    now.setMinutes(now.getMinutes() + offsetInMinutes);
    return now.toISOString();
  }

  function handleLogin(user, req, res, next) {
    var token;
    var profile;
    var tokenExpiresInMinutes;
    var envelope = {
      data: user,
      isAuthenticated: true,
      meta: {}
***REMOVED***

    // First handle the case where the user was not logged in.
    if (!user) {
      if (authConfig.maintenance === 'cookie') {
        req.logout();
***REMOVED***
      return res.send(401, 'Wrong password or no such user.');
    }

    // Now handle the case where we did get a user record.
    if (authConfig.maintenance === 'token') {
      // For token authentication we want to add a token.
      profile = {
        username: user.username,
        email: user.email,
        userdata_id: user.userdata_id
***REMOVED***;
      tokenExpiresInMinutes = authConfig.expiresInMinutes || 60;
      envelope.meta.token = jwt.sign({data:profile}, secrets.authTokenSecret, {
        expiresInMinutes: tokenExpiresInMinutes
  ***REMOVED***
      envelope.meta.expires = getExpirationTime(tokenExpiresInMinutes);
      return res.send(200, envelope);
    } else if (authConfig.maintenance === 'cookie') {
      // For cookie authentication we want to login the user.
      req.login(user, function(err) {
        if (err) {
          return next(err);
***REMOVED*** else {
          return res.send(200, envelope);
***REMOVED***
  ***REMOVED***
    }
  }

  // Configure password authentication if necessary.
  if (authConfig.strategy === 'password') {
    passwordAuth.setup(app, users, {
      callback: handleLogin
***REMOVED***
  }
};

exports.saveUser = passwordAuth.saveUser;
