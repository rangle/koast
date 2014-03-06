/* global angular */

angular.module('koast-user', [])

// A "private" service that works as a wrapper around Mozilla's Persona.
.factory('_koastPersona', ['$http', '$q', '$interval', '$log',
  function ($http, $q, $interval, $log) {
    'use strict';

    var service = {};
    var userInitiatedAction = false;
    var readyDeferred = $q.defer();

    // Loads persona shim assyncronously. Per persona documentation we must
    // load the shim from persona.org server (since the protocol is subject to
    // change). Persona.org can be pretty slow, however, so loading the shim
    // synchronously ruins the user experience. So, that's the reason for
    // async loading.
    function loadPersonaShim() {
      var doc = window.document;
      var head = doc.getElementsByTagName('head')[0];
      var script = doc.createElement('script');
      var deferred = $q.defer();
      var interval;

      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://login.persona.org/include.js';
      head.appendChild(script);

      interval = $interval(function () {
        if (window.navigator.id) {
          deferred.resolve();
          $interval.cancel(interval);
***REMOVED***
***REMOVED*** 50);

      return deferred.promise;
    }

    // Verifies a persona assertion by 
    function verifyAssertion(assertion) {
      $log.debug('verifyAssertion:');
      var postParams = {
        assertion: assertion,
        audience: 'http://localhost:3000/'
***REMOVED***;
      var config = {
        timeout: 2000
***REMOVED***;
      return $http.post('/auth/browserid', postParams, config)
        .then(function (response) {
          $log.debug('Response:', response);
          return response.data;
***REMOVED***)
        .then(null, function (error) {
          if (typeof error === 'object' && error.headers) {
            // This is angular's weird way of letting us know about a timeout!
            $log.error('Persona verification timed out.');
            throw new Error ('Persona verification timed out.');
  ***REMOVED*** else {
            $log.error('Error verifying Persona assertion:', error.toString());
            $log.error(error.stack);
            throw error;
  ***REMOVED***
    ***REMOVED***
    }

    /** 
     * Initiates sign in with Mozilla's persona. The thing to keep in mind
     * here is that Persona sign up process is non-modal, so we don't really
     * know what is happening there until the user either completes or cancels
     * it. The user can be interacting with our site while Persona's sign up
     * window is available. Not much we can do about this.
     *
     * @param  {Object} options    An object representing options.
     * @return {undefined}         Noting is returned.
     */
    service.initiateSignIn = function (options) {
      if (!options) {
        options = {};
***REMOVED***
      $log.debug('signIn');
      userInitiatedAction = true;
      navigator.id.request({
        siteName: options.siteTitle,
        oncancel: function () {
          $log.info('Persona login cancelled by user.');
***REMOVED***
  ***REMOVED***
***REMOVED***


    /** 
     * Initiates sign in with Mozilla's persona. In this case few things should
     * prevent Persona from actually completing the sign out, but we don't
     * really get to know what's going on. We just start the process here and
     * hope for the best.
     *
     * @param  {Object} options    An object representing options.
     * @return {undefined}         Noting is returned.
     */
    service.initiateSignOut = function () {
      userInitiatedAction = true;
      navigator.id.logout();
***REMOVED***

    /**
     * Initializes persona. This method will request persona JS shim from the
     * server and set it up when the shim arrives. Once we setup Persona
     * watch, it may call onlogin or onlogout before any user action.
     * In our case we just ignore those calls. In other words, we do not care
     * whether Persona thinks the user is already logged in or not. We only
     * want to know about logins and logouts that are activated by the user.
     * This method returns a promise that resolves when persona is fully ready.
     *
     * @param  {Object} options    An object representing options.
     * @return {promise}           A $q promise that resolves when persona is
     *                             ready.
     */
    service.init = function (options) {
      loadPersonaShim()
        .then(function () {
          $log.debug('navigator.id.watch added');
          navigator.id.watch({
            loggedInUser: null, // to block autologin
            onlogin: function (assertion) {
              if (userInitiatedAction) {
                verifyAssertion(assertion)
                  .then(function (user) {
                    options.onSignIn(user);
            ***REMOVED*** $log.error);
  ***REMOVED***
      ***REMOVED***
            onlogout: function () {
              if (userInitiatedAction) {
                options.onSignOut();
  ***REMOVED***
      ***REMOVED***
            onready: function () {
              readyDeferred.resolve();
***REMOVED***
      ***REMOVED***
***REMOVED***)
        .then(null, $log.error);
      return readyDeferred.promise;
***REMOVED***

    /**
     * Returns a promise that resolves when persona is ready.
     * @return {promise}           A $q promise that returns when persona is
     *                             ready.
     */
    service.whenReady = function () {
      return readyDeferred.promise;
***REMOVED***

    return service;
  }
])

// A "private" service that represents the user.
.factory('_koastUser', ['_koastPersona', '$q', '$log', '$timeout',
  function (koastPersona, $q, $log, $timeout) {
    'use strict';

    var user = {
      isSignedIn: false
***REMOVED***
    var registrationHandler;
    var deferredSignIn = $q.defer();

    if (window.sessionStorage.userMeta) {
      $log.debug('sessionStorage.userMeta:', window.sessionStorage.userMeta);
      $log.debug('sessionStorage.userData:', window.sessionStorage.userData);
      user.isSignedIn = true;
      user.meta = angular.fromJson(window.sessionStorage.userMeta) || {};
      user.data = angular.fromJson(window.sessionStorage.userData) || {};
      deferredSignIn.resolve();
    } else {
      user.isSignedIn = false;
      user.data = {};
      user.meta = {};
    }

    // Initiates the user service. Right now this means we load Mozilla Persona.
    user.init = function (options) {
      $log.debug('koastUser.init');
      options.onSignIn = function (response) {
        user.data = response.data;
        user.meta = response.meta;
        $log.debug('user.data:', user.data);
        $log.debug('user.meta:', user.meta);
        window.sessionStorage.userData = angular.toJson(user.data);
        window.sessionStorage.userMeta = angular.toJson(user.meta);
        if (user.meta.isNew && registrationHandler) {
          $log.debug('scheduling the registration handler');
          $timeout(function() {
            registrationHandler()
              .then(deferredSignIn.resolve, $log.error);
    ***REMOVED*** 0);
***REMOVED*** else {
          $log.debug('Resolving deferredSignIn.');
          deferredSignIn.resolve();
***REMOVED***
        user.isSignedIn = true;
***REMOVED***;
      options.onSignOut = function () {
        $log.debug('onSignOut');
        $timeout(function() {
          user.data = {};
          user.isSignedIn = false;
    ***REMOVED***
***REMOVED***;
      koastPersona.init(options);
      koastPersona.whenReady()
        .then(function () {
          user.isReady = true;
  ***REMOVED*** $log.error);
***REMOVED***

    // Initiates signIn - just calls persona's function.
    user.signIn = koastPersona.initiateSignIn;

    // Initiates signOut - just calls persona's function.
    user.signOut = koastPersona.initiateSignOut;

    // Attaches a registration handler - afunction that will be called when we
    // have a new user.
    user.setRegistrationHanler = function (handler) {
      registrationHandler = handler;
***REMOVED***

    // Returns a promise that resolves when a user is logged in.
    user.whenSignedIn = function() {
      return deferredSignIn.promise;
***REMOVED***

    return user;
  }
]);