/* globals require, exports */
'use strict';

// This is tentative (untested) implementation of password authentication.

var bcrypt = require('bcrypt');
var Q = require('q');
***REMOVED***

var log = require('../../log');

function comparePasswords(password1, password2) {
  var deferred = Q.defer();
  bcrypt.compare(password1, password2, deferred.makeNodeResolver());
  return deferred.promise;
}

function accept() {
  // placeholder
}

function reject() {
  // placeholder
}

function reportError() {
  // placeholder
}

function makeHandlers (done) {
  return {
    reject: function (message) {
      done(null, false, {
        message: 'No such user or wrong password.'
  ***REMOVED***
    },
    accept: function (user) {
      done(null, user);
    },
    reportError: function (error) {
      log.error(error);
      log.error(error.stack);
      done(error, false, {
        message: 'Sorry something went wrong. Please try again later.'
  ***REMOVED***
    }
  };
}

exports.makeAuthenticator = function(userModel) {
  var authenticator = {};

  // Decides whether the username and password combination should be accepted.
  authenticator.verify = function(username, password, done) {
    var userQuery = {
      username: username
***REMOVED***
    var handlers = makeHandlers(done);
    userModel.findOne(userQuery).exec()
      .then(function(user) {
        if (!user) {
          return false;
***REMOVED*** else {
          expect(user.username).to.equal(username);
          log.debug('passport.localStrategy: found user %s.', username);
          return comparePasswords(password, user.password);
***REMOVED***
***REMOVED***)
      .then(function(isMatch) {
        if (isMatch) {
          accept(username);
***REMOVED*** else {
          reject();
***REMOVED***
***REMOVED***)
      .then(null, reportError)
      .then(null, log.error); // In case we've got an error in error handling
  };

  // Converts the user to a string.
  authenticator.serializeUser = function(user, done) {
    done(null, JSON.stringify(user));
  };

  // Converts serialized user representation into a full user record.
  exports.deserializeUser = function(serializedUser, done) {
    done(null, JSON.parse(serializedUser));
  };

  return authenticator;
};