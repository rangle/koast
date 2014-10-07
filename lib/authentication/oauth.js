/** @module lib/authentication/oauth */
/* global require, exports */
'use strict';

var passport = require('passport');
var Q = require('q');
var strategies = {
  google: require('passport-google-oauth').OAuth2Strategy,
  facebook: require('passport-facebook').Strategy,
  twitter: require('passport-twitter').Strategy
};

var log = require('../log');

// Should be made configurable eventually.
var oauthOptions = {
  google: {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }
};

/**
 * Looks up user in the database and generates an enveloped user record based
 * on that.
 *
 * @function getUserFromProfile
 * @param {todo} providerAccounts  TODO
 * @param {todo} profile  TODO
 */
exports.getUserFromProfile = function (providerAccounts, profile) {
  log.debug(profile);
  if (!profile) {
    return Q.resolve();
  }
  var query = {
    provider: profile.provider,
    idWithProvider: profile.idWithProvider
  };

  return providerAccounts.find(query).exec()
    .then(function (results) {
      var userRecord = {
        isAuthenticated: true,
        meta: {}
      };
      if (results && results.length > 0) {
        log.debug('Old user!', results[0]);
        userRecord.data = results[0];
        if (userRecord.data.username) {
          userRecord.meta.isRegistered = true;
        }
      }
      return userRecord;
    });
};

// Makes a handler to be called after the user was authenticated with an OAuth
// provider.
function makeLoginHandler(provider, providerAccounts) {
  return function (accessToken, refreshToken, profile, done) {
    log.debug('Authentiated for ' + provider);
    log.debug(profile);

    profile.provider = provider;
    profile.idWithProvider = profile.id;

    exports.getUserFromProfile(providerAccounts, profile)
      .then(function (userRecord) {
        // Save the user if they are new.
        var fieldsToCopy = ['provider', 'displayName', 'emails'];
        if (userRecord && userRecord.data) {
          return userRecord;
        } else {
          userRecord = {
            isAuthenticated: true
          };
          userRecord.meta = {
            isRegistered: false
          };
          userRecord.data = {
            idWithProvider: profile.id,
          };
          fieldsToCopy.forEach(function (key) {
            userRecord.data[key] = profile[key];
          });
          return providerAccounts.create(userRecord.data)
            .then(function () {
              return userRecord;
            });
        }
      })
      .then(function (userRecord) {
        done(null, userRecord);
      })
      .then(null, function (error) {
        log.error(error);
        done(error);
      })
      .then(null, log.error);
  };
}

// Redirects the user to the new url.
function redirectToNext(req, res) {
  var redirectTo = req.session.next || '';
  req.session.next = null; // Null it so that we do not use it again.
  res.redirect(redirectTo);
}

// This function is invoked when the user hits an /auth/<provider> route.  It
// gets a redirection value from the query string ('next') and stores it in
// the session. When the authorization is complete, we read this value to
// determine where the user should go next.
function saveNextUrl(req, res, next) {
  req.session.next = req.query.next || null;
  next();
}

/**
 * Sets up OAuth authentication for one provider.
 *
 * @function init
 * @param {TODO} app TODO
 * @param {TODO} provider TODO
 * @param {TODO} config TODO
 * @param {TODO} providerAccounts TODO
 */
exports.init = function (app, provider, config, providerAccounts) {
  var Strategy = strategies[provider];
  var handler = makeLoginHandler(provider, providerAccounts);
  passport.use(new Strategy(config, handler));

  // Add a route that would get hit to start the authentication process.
  app.get(
    '/auth/' + provider,
    // saveNextUrl,
    passport.authenticate(provider, oauthOptions[provider])
  );

  // Add a route where the provider would send afterwards.
  app.get(
    '/auth/' + provider + '/callback',
    // function(req, res, next) {
    //   console.log('getting forward to the callback.')
    //   next();
    // },
    passport.authenticate(provider, {
      successRedirect: '/',
      failureRedirect: '/'
    }) //, redirectToNext)
  );
};
