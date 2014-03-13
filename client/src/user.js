/* global angular */

angular.module('koast-user', [])

// Abstracts out some OAuth-specific logic.
.factory('_koastOauth', ['$window', '$location', '$log',
  function ($window, $location, $log) {
    'use strict';

    var service = {};
    var baseUrl = 'http://127.0.0.1:3000';

    // Makes a URL for the OAuth provider.
    function makeAuthUrl(provider, nextUrl) {
      return baseUrl + 'auth/' + provider + '?next=' +
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

    return service;
  }
])

// A service that represents the logged in user.
.factory('_koastUser', ['_koastOauth', '$log', '$timeout', '$http', '$window',
  function (koastOauth, $log, $timeout, $http, $window) {
    'use strict';

    // This is our service, which is an object that represents the user. The
    // app should be able to just add this to the scope.
    var user = {
      isAuthenticated: false, // Whether the user is authenticated or anonymous.
      data: {}, // User data coming from the database or similar.
      meta: {} // Metadata: registration status, tokens, etc.
***REMOVED***

    var registrationHandler; // An optional callback for registering an new user.
    var statusPromise; // A promise resolving to user's authentication status.

    // Retrieves user's data from the server. This means we need to make an
    // extra trip to the server, but the benefit is that this method works
    // across a range of authentication setups and we are not limited by
    // cookie size.
    function getUserData(url) {
      // First get the current user data from the server.
      return $http.get(url || '/auth/user')
        .then(function (response) {
          var newUser = response.data;
          // Figure out if the user is signed in. If so, update user.data and
          // user.meta.
          if (newUser.isAuthenticated) {
            user.data = newUser.data;
            user.meta = newUser.meta;
  ***REMOVED***
          user.isAuthenticated = newUser.isAuthenticated;
          return newUser.isAuthenticated;
***REMOVED***)
        .then(function (isAuthenticated) {
          $log.debug('isAuthenticated?', isAuthenticated);
          // Call the registration handler if the user is new and the handler
          // is defined.
          if (isAuthenticated && (!user.meta.isRegistered) &&
            registrationHandler) {
            // Using $timeout to give angular a chance to update the view.
            // $timeout returns a promise for a promise that is returned by
            // $registrationHandler.
            return $timeout(registrationHandler, 0)
              .then(function () {
                return isAuthenticated;
          ***REMOVED***
  ***REMOVED*** else {
            user.isReady = true;
            return isAuthenticated;
  ***REMOVED***
***REMOVED***)
        .then(null, $log.error);
    }

    // Initiates the login process.
    user.initiateOauthAuthentication = function (provider) {
      koastOauth.initiateAuthentication(provider);
***REMOVED***

    // Posts a logout request.
    user.logout = function (nextUrl) {
      return $http.post('/auth/logout')
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

    // Registers the user. 
    user.register = function (data) {
      return $http.put('/auth/user', data)
        .then(function () {
          return getUserData();
    ***REMOVED***
***REMOVED***

    // Checks if a username is available.
    user.checkUsernameAvailability = function (username) {
      return $http.get('/auth/usernameAvailable', {
        params: {
          username: username
***REMOVED***
***REMOVED***)
        .then(function (result) {
          return result.data === 'true';
***REMOVED***)
        .then(null, $log.error);
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

    // Initializes the user service.
    user.init = function (options) {
      koastOauth.setBaseUrl(options.baseUrl);
      return user.getStatusPromise();
***REMOVED***

    return user;
  }
]);