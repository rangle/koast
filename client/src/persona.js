/* global angular */

angular.module('koast-persona', [])

// A "private" service that works as a wrapper around Mozilla's Persona.
.factory('_koastPersona', ['$http', '$q', '$interval', '$location', '$log',
  function ($http, $q, $interval, $location, $log) {
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
      var audience = $location.absUrl().split('/').slice(0,3).join('/') + '/';
      var postParams = {
        assertion: assertion,
        audience: audience
***REMOVED***;
      $log.info('audience:', audience);
      var config = {
        timeout: 5000
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
]);