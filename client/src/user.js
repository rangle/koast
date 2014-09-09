/* global angular */

angular.module('koast-user', [
  'koast.logger',
  'koast.http'
])

// Abstracts out some OAuth-specific logic.
.factory('_koastOauth', ['$window', '$location', '$log', '_koastLogger',
  function ($window, $location, $log, _koastLogger) {
    'use strict';

    var service = {};

    var log = _koastLogger;

    // This is only a default value, the Koast client must set baseUrl via Koast.init()
    // if the client is served on a different server than that of the API server.
    var baseUrl = $location.absUrl().split('/').slice(0, 3).join('/');


    // Makes a URL for the OAuth provider.
    function makeAuthUrl(provider, nextUrl) {
      return baseUrl + '/auth/' + provider + '?next=' +
        encodeURIComponent(nextUrl);
    }

    // Sends the user to the provider's OAuth login page.
    service.initiateAuthentication = function (provider) {
      var newUrl = makeAuthUrl(provider, $location.absUrl());
      $window.location.replace(newUrl);
***REMOVED***

    // Sets a new base URL
    service.setBaseUrl = function (newBaseUrl) {
      baseUrl = newBaseUrl;
***REMOVED***

    // expects end point to precede with a forward-slash "/"
    service.makeRequestURL = function (endPoint) {
      if (!endPoint){
        endPoint = ""
***REMOVED***
      return baseUrl + endPoint;
***REMOVED***

    return service;
  }
])

// A service that represents the logged in user.
.factory('_koastUser', ['_koastOauth', '_koastHttp', '_koastLogger', '$log', '$timeout', '$http', '$window', '$q',
  function (koastOauth, _koastHttp, _koastLogger, $log, $timeout, $http, $window, $q) {
    'use strict';

    var log = _koastLogger.makeLogger('koast.user');
    var koastHttp = _koastHttp;

    // This is our service, which is an object that represents the user. The
    // app should be able to just add this to the scope.
    var user = {
      isAuthenticated: false, // Whether the user is authenticated or anonymous.
      isReady: false, // Whether the user's status is known.
      data: {}, // User data coming from the database or similar.
      meta: {} // Metadata: registration status, tokens, etc.
***REMOVED***

    var registrationHandler; // An optional callback for registering an new user.
    var statusPromise; // A promise resolving to user's authentication status.
    var authenticatedDeferred = $q.defer();

    // Inserts a pause into a promise chain if the debug config requires it.
    function pauseIfDebugging(value) {
      var delay = user.debug.delay;
      if (delay) {
        $log.debug('Delayng for ' + delay + ' msec.');
        return $timeout(function() {
          return value;
  ***REMOVED*** delay);
***REMOVED*** else {
        return value;
***REMOVED***
    }

    // Sets the user's data and meta data.
    // Returns true if the user is authenticated.
    function setUser(responseBody) {
      var valid = responseBody && responseBody.data;
      var newUser;
      log.debug('Setting the user based on', responseBody.data);
      if (!valid) {
        log.warn('Did not get back a valid user record.', responseBody);
        user.data = {};
        user.isAuthenticated = false;
        user.meta = {};
***REMOVED*** else {
        // Figure out if the user is signed in. If so, update user.data and
        // user.meta.
        if (responseBody.isAuthenticated) {
          user.data = responseBody.data;
          user.meta = responseBody.meta;
          if (user.meta.token) {
            koastHttp.saveToken({
              token: user.meta.token,
              expires: user.meta.expires
        ***REMOVED***
  ***REMOVED***
          authenticatedDeferred.resolve();
***REMOVED***
        user.isAuthenticated = responseBody.isAuthenticated;
***REMOVED***
      user.isReady = true;
      return user.isAuthenticated;
    }

    // Calls registration handler if necessary. Returns a boolean indicating
    // whether the user is authenticated or a promise for such a boolean.
    function callRegistrationHandler(isAuthenticated) {
      // Call the registration handler if the user is new and the handler
      // is defined.
      if (isAuthenticated && (!user.meta.isRegistered) &&
        registrationHandler) {
        // Using $timeout to give angular a chance to update the view.
        // $timeout returns a promise equivalent to the one returned by
        // registrationHandler.
        return $timeout(registrationHandler, 0)
          .then(function () {
            return isAuthenticated;
      ***REMOVED***
***REMOVED*** else {
        return isAuthenticated;
***REMOVED***
    }

    // Retrieves user's data from the server. This means we need to make an
    // extra trip to the server, but the benefit is that this method works
    // across a range of authentication setups and we are not limited by
    // cookie size.
    function getUserData(url) {

      // First get the current user data from the server.
      return koastHttp.get(url || '/auth/user')
        .then(null, function(response) {
          if (response.status===401) {
            return null;
  ***REMOVED*** else {
            throw response;
  ***REMOVED***
***REMOVED***)
        .then(pauseIfDebugging)
        .then(setUser)
        .then(callRegistrationHandler);
    }

    // Initiates the login process.
    user.initiateOauthAuthentication = function (provider) {
      koastOauth.initiateAuthentication(provider);
***REMOVED***
    
    // Posts a logout request.
    user.logout = function (nextUrl) {
      koastHttp.deleteToken();
      return $http.post(koastOauth.makeRequestURL('/auth/logout'))
        .then(function (response) {
          if (response.data !== 'Ok') {
            throw new Error('Failed to logout.');
  ***REMOVED*** else {
            $window.location.replace(nextUrl || '/');
  ***REMOVED***
***REMOVED***)
        .then(null, function (error) {
          $log.error(error);
          throw error;
    ***REMOVED***
***REMOVED***

    // user logs in with local strategy
    user.loginLocal = function(user) {
      $log.debug('Login:', user.username);
      var body = {
        username: user.username,
        password: user.password
***REMOVED***;
      return $http.post(koastOauth.makeRequestURL('/auth/login'), body)
        .then(function(response) {
          log.debug('loginLocal:', response);
          return response.data;
***REMOVED***)
        .then(setUser);
***REMOVED***

    // Registers the user (social login)
    user.registerSocial = function (data) {
      return $http.put(koastOauth.makeRequestURL('/auth/user'), data)
        .then(function () {
          return getUserData();
    ***REMOVED***
***REMOVED***

    // Registers the user (local strategy)
    user.registerLocal = function (userData) {
      return $http.post(koastOauth.makeRequestURL('/auth/user'), userData);
***REMOVED***

    // Checks if a username is available.
    user.checkUsernameAvailability = function (username) {
      var url = koastOauth.makeRequestURL('/auth/usernameAvailable');
      return $http.get(url, {
        params: {
          username: username
***REMOVED***
***REMOVED***)
        .then(function (result) {
          return result.data === 'true';
***REMOVED***)
        .then(null, $log.error);
***REMOVED***

    user.resetPassword = function(email){
      return $http.post(koastOauth.makeRequestURL('/forgot'), {email: email***REMOVED***
***REMOVED***

    user.setNewPassword = function(newPassword, token){
      return $http.post(koastOauth.makeRequestURL('/reset/' + token), {password: newPassword***REMOVED***
***REMOVED***

    // Attaches a registration handler - afunction that will be called when we
    // have a new user.
    user.setRegistrationHanler = function (handler) {
      registrationHandler = handler;
***REMOVED***

    // Returns a promise that resolves to user's login status.
    user.getStatusPromise = function () {
      if (!statusPromise) {
        statusPromise = getUserData();
***REMOVED***
      return statusPromise;
***REMOVED***

    user.whenStatusIsKnown = user.getStatusPromise;

    // Initializes the user service.
    user.init = function (options) {
      options.debug = options.debug || {};
      user.debug = options.debug;
      koastHttp.setOptions(options);
      koastOauth.setBaseUrl(options.baseUrl);
      return user.getStatusPromise();
***REMOVED***

    // Returns a promise that resolves when the user is authenticated.
    user.whenAuthenticated = function() {
      return authenticatedDeferred.promise;
***REMOVED***

    return user;
  }
]);
