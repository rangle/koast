/** @module lib/authentication/authentication */
/* global require, exports */

'use strict';

var Q = require('q');
var _ = require('underscore');
var jwt = require('jsonwebtoken');

var config = require('../config');
var log = require('../log');
var oauth = require('./oauth');
var passwordAuth = require('./password');
var authMaintenance = require('./maintenance');
var util = require('../util/util');
var dbUtils = require('koast-db-utils');

var MONGOOSE_DUPLICATE_KEY_ERROR = 11000;

function assertAuthConfiguration(authConfig) {
  var maintenance = ['cookie', 'token'];

  if (!authConfig.strategy || authConfig.strategy === 'disabled') {
    return;
  }

  if (maintenance.indexOf(authConfig.maintenance) < 0) {
    log.failure('Auth Strategy [%s] requires maintenance of ' +
      '"cookie" or "token", found [%s]', authConfig.strategy, authConfig.maintenance
    );
  }

}



/**
 * Adds routes for authentication and related things.
 *
 * @param {Object} app             An express app.
 */
exports.addAuthenticationRoutes = function (app) {


  var connection = dbUtils.getConnectionNow();
  var providerAccounts = connection.model('userProviderAccounts');
  var users = connection.model('users');
  var secrets = config.getConfig('secrets');
  var authConfig = config.getConfig('authentication');
  var oauthConfig = config.getConfig('oauth');

  if (!authConfig || authConfig.strategy === 'disabled') {
    log.warn(
      'Auth Configuration has not been setup, or has been set to disabled');
    return;
  }

  assertAuthConfiguration(authConfig);

  function generateToken(data, expires, secret) {
    var newToken = jwt.sign({
      data: data
    }, secret, {
      expiresInMinutes: expires
    });
    return newToken;
  }

  function getTokenRefresh(req, res, next) {
    var secrets = config.getConfig('secrets');
    var currentToken = req.headers.authorization.replace('Bearer ', '');
    var decodedToken = jwt.decode(currentToken);

    var expiresInMinutes = 60;
    var newToken = generateToken(decodedToken.data, expiresInMinutes,
      secrets.authTokenSecret);

    log.debug('getNewToken requested with: ', currentToken);
    log.debug('token decoded as :', decodedToken);

    res.status(200).send({

      token: newToken,
      expires: getExpirationTime(expiresInMinutes)

    });
  };
  // depends on auth config
  function handleLogin(user, req, res, next) {


    var token;
    var profile;
    var tokenExpiresInMinutes;
    var envelope = {
      data: user,
      isAuthenticated: true,
      meta: {}
    };

    // First handle the case where the user was not logged in.
    if (!user) {
      if (authConfig.maintenance === 'cookie') {
        req.logout();
      }
      return res.status(401).send('Wrong password or no such user.');
    }
    // user_id is how it is in the schema
    /* jshint ignore:start */
    // Now handle the case where we did get a user record.
    if (authConfig.maintenance === 'token') {
      // For token authentication we want to add a token.
      profile = {
        username: user.username,
        email: user.email,
        userdata_id: user.userdata_id
      };
      /* jshint ignore:end */
      tokenExpiresInMinutes = authConfig.expiresInMinutes || 60;
      envelope.meta.token = generateToken(profile, tokenExpiresInMinutes,
        secrets.authTokenSecret);

      envelope.meta.expires = getExpirationTime(tokenExpiresInMinutes);
      return res.status(200).send(envelope);
    } else if (authConfig.maintenance === 'cookie') {
      // For cookie authentication we want to login the user.
      req.login(user, function (err) {
        if (err) {
          return next(err);
        } else {
          return res.status(200).send(envelope);
        }
      });
    }
  };

  // GET /auth/user - returns info about the logged in user, in an envelope.
  function getAuthUser(req, res) {
    res.status(200).send(req.user);
  }

  // depends on oauth, and provider accounts
  // PUT /auth/user - update the current user's record. This is meant to be
  // used for the purpose of registration, etc. For now we only allow this
  // method to set username. This is currently working only for OAuth users.
  function putAuthUser(req, res) {
    var query;
    var update;

    // Check if the user is actually logged in. We should try to update info
    // for an anonymous user.
    if (!(req.user && req.user.data)) {
      res.status(401).send('Not authenticated');

      return;
    }

    // For right now, we do not allow the user to change their username if it
    // has been set before.
    if (req.user.username) {
      res.status(422).send(
        'You cannot change the user name of a registered user.');
      return;
    }

    // Setup and execute an update query.
    query = {
      provider: req.user.data.provider,
      idWithProvider: req.user.data.idWithProvider
    };
    update = {
      username: req.body.username
    };

    providerAccounts.update(query, update).exec()
      .then(function () {

        // Now we need to update user's data in the session. The simplest way
        // to do that is to first get the current user's data.
        return oauth.getUserFromProfile(providerAccounts, req.user.data)
          .then(function (userRecord) {
            if (!userRecord) {
              throw new Error('Could not get user record.');
            }
            // Once we have the userRecord, we try to update the session.
            if (authConfig.maintenance === 'cookie') {
              req.login(userRecord, function (error) {
                if (error) {
                  throw error;
                } else {
                  res.status(200).send(userRecord);
                }
              });
            } else {
              // generate a new token
              var secrets = config.getConfig('secrets');
              var currentToken = req.headers.authorization.replace(
                'Bearer ', '');
              var decodedToken = jwt.decode(currentToken);

              var expiresInMinutes = 60;
              decodedToken.data.username = userRecord.data.username;
              var newToken = generateToken(decodedToken.data,
                expiresInMinutes,
                secrets.authTokenSecret);

              userRecord.meta = userRecord.meta || {};
              userRecord.meta.token = newToken;
              userRecord.meta.expires = getExpirationTime(
                expiresInMinutes);

              log.debug('getNewToken requested with: ', currentToken);
              log.debug('token decoded as :', decodedToken);


              res.status(200).send(userRecord);
            }
          });
      })
      .then(null, util.makeErrorResponder(res));
  }

  // POST /auth/user - Add (register) a new user
  // depends on passwordAuth, users
  function postAuthUser(req, res) {
    if (!req.body.username || !req.body.password || !req.body.displayName ||
      !
      req
      .body.email) {
      res.status(422).send('You must provide username, email, and password');
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
    userExists(user.username)
      .then(function(exists) {
        if (!exists) {
          return passwordAuth.saveUser(user, req.body.password)
          .then(function (user) {
            if (user) {
              log.info('New user saved to the database:', user.username);
              res.status(200).send(user);
            }
          });
        }

        var err = new Error('Usename already exists');
        err.code = 'E_USERNAME_EXISTS';
        return Q.reject(err);
      })
      .then(null, function (err) {
        if (err &&
            (err.code === 'E_USERNAME_EXISTS' ||
             err.code === MONGOOSE_DUPLICATE_KEY_ERROR)) {
          log.error('Could not save user. Is username unique?');
          return res.status(422).send('Username already exists.');
        }

        log.error(err.message);
        return res.status(500).send('Internal error');
      });
  }

  // POST /auth/logout - logs out the user.
  // depends on authMaintence
  function postAuthLogout(req, res) {
    if (authMaintenance.usingSessions) {
      req.logout();
    }
    res.status(200).send('Ok');
  }

  function userExists(username) {
    var query = {
      username: username
    };

    var userCollection = authConfig.strategy === 'password' ? users :
      providerAccounts;

    return userCollection.find(query).exec()
      .then(function(matchingUsers) {
        return matchingUsers.length > 0;
      });
  }

  // GET /auth/usernameAvailable - checks if a username is available.
  // depends on users, or providerAccounts
  function getAuthUsernameAvailable(req, res) {

    if (!req.query || !req.query.username) {
      res.status(400).send('Please provide a username');
    } else {
      userExists(req.query.username)
        .then(function (exists) {
          res.status(200).send({
            data: !exists
          });
        })
        .then(null, util.makeErrorResponder(res));
    }
  }

  exports.routes = [{
      method: 'get',
      route: 'auth/user',
      handler: getAuthUser
    }, {
      method: 'post',
      route: 'auth/user',
      handler: postAuthUser
    }, {
      method: 'put',
      route: 'auth/user',
      handler: putAuthUser
    }, {
      method: 'post',
      route: 'auth/logout',
      handler: postAuthLogout
    }, {
      method: 'get',
      route: 'auth/usernameAvailable',
      handler: getAuthUsernameAvailable
    }, {
      method: 'get',
      route: 'auth/token/refresh',
      handler: getTokenRefresh
    }

  ];

  // For now configure this regardless of authentication config, for backwards
  // compatibility.
  if (oauthConfig) {
    log.verbose('Adding OAuth routes');
    // Finally, use oauth.init to setup routes for all configured providers.
    _.keys(oauthConfig).forEach(function (provider) {
      oauth.init(app, provider, oauthConfig[provider], providerAccounts);
    });
  }

  function getExpirationTime(offsetInMinutes) {
    var now = new Date();
    now.setMinutes(now.getMinutes() + offsetInMinutes);
    return now.toISOString();
  }



  // Configure password authentication if necessary.
  if (authConfig.strategy === 'password') {

    passwordAuth.setup(app, users, {
      callback: handleLogin
    });

  }
};


exports.defaults = {};
exports.defaults.authorization = function defaultAuthorization(req, res) {
  return true;
};

exports.addAuthMaintenance = authMaintenance.addAuthMaintenance;
exports.saveUser = passwordAuth.saveUser;
