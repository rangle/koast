/* globals require, exports */
'use strict';

// This is tentative (untested) implementation of password authentication.

var passport = require('passport');
var bcrypt = require('bcrypt');
var Q = require('q');
***REMOVED***
var LocalStrategy = require('passport-local').Strategy
var log = require('../log');

function comparePasswords(password1, password2) {
  var deferred = Q.defer();
  bcrypt.compare(password1, password2, deferred.makeNodeResolver());
  return deferred.promise;
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

function makeVerifyFunction (users, config) {
  return function verify(username, password, done) {
    log.debug('Verifying:', username, password);
    var userQuery = {
      username: username
***REMOVED***
    var handlers = makeHandlers(done);
    users.findOne(userQuery).exec()
      .then(function(user) {
        user = user.toObject();
        log.debug('found:', user);
        if (!user) {
          done(null, false); // reject
***REMOVED*** else {
          expect(user.username).to.equal(username);
          log.debug('passport.localStrategy: found user %s.', username);
          //return comparePasswords(password, user.password);
          done(null, user); // accept
***REMOVED***
***REMOVED***)
      .then(null, done); // report error
  };
};

exports.setup = function(app, users, config) {
  // Setup the authentication strategy
  var strategy = new LocalStrategy(makeVerifyFunction(users, config));
  passport.use(strategy);
  // Setup a route using that strategy
  app.post('/auth/login', function(req, res, next) {
    console.log('/auth/login', req.query.username, req.query.password);
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        console.log(err);
        return next(err)
***REMOVED***
      if (!user) {
        req.logout();
        res.send(401, 'Wrong password or no such user.');
***REMOVED*** else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
  ***REMOVED***
          return res.send(200, user);
    ***REMOVED***
***REMOVED***
    })(req, res, next);
***REMOVED***
}