/* global angular */

angular.module('koast', ['koast-user', 'koast-resource'])

// The public service for use by the developer.
.factory('koast', ['_koastUser', '_koastResourceGetter', '$log',
  function (koastUser, koastResourceGetter, $log) {
    'use strict';
    var service = {};
    var resourceGetterMethodsToCopy = [
      'setApiUriPrefix',
      'getResource',
      'createResource',
      'queryForResources',
      'addEndpoint'
    ];

    // For koastUser, we just attach the service as a field.
    service.user = koastUser;

    // For koastResourceGetter we basically copy all the methods except init.
    resourceGetterMethodsToCopy.forEach(function (functionName) {
      service[functionName] = koastResourceGetter[functionName];
***REMOVED***

    service.init = function (options) {
      $log.info('Initializing koast.');
      koastUser.init(options);
***REMOVED***

    return service;
  }
]);
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
/* global angular, _ */

angular.module('koast-resource', ['koast-user'])

.factory('_KoastServerHelper', ['_koastUser',
  function(user) {
    'use strict';
    var service = {};
    service.addAuthHeaders = function (headers) {
      if (user.isSignedIn) {
        headers['koast-auth-token'] = user.meta.authToken;
        headers['koast-auth-token-timestamp'] = user.meta.timestamp;
        headers['koast-user'] = angular.toJson(user.data);
***REMOVED***
***REMOVED***
    return service;
  }])

// A "private" service providing a constructor for resources.
.factory('_KoastResource', ['_KoastServerHelper', '$q', '$http', '$log',
  function (KoastServerHelper, $q, $http, $log) {
    'use strict';
    // A client side representation of a saveable RESTful resource instance.
    function Resource(endpoint, result) {
      var resource = this;
      _.keys(result.data).forEach(function (key) {
        resource[key] = result.data[key];
  ***REMOVED***

      Object.defineProperty(this, 'can', {
        get: function () {
          return result.meta.can;
***REMOVED***
  ***REMOVED***

      Object.defineProperty(this, '_endpoint', {
        get: function () {
          return endpoint;
***REMOVED***
  ***REMOVED***

      return this;
    }

    // A method for saving the resource
    Resource.prototype.save = function () {
      var url = this._endpoint.makeGetUrl(this);
      var headers = {};
      KoastServerHelper.addAuthHeaders(headers);
      return $http.put(url, this, {headers: headers***REMOVED***
***REMOVED***

    // A method for deleting the resource
    Resource.prototype.delete = function () {
      $log.debug('The endpoint: ', this._endpoint);
      var url = this._endpoint.makeGetUrl(this);
      $log.debug('delete url:', url);
      var headers = {};
      KoastServerHelper.addAuthHeaders(headers);
      return $http.delete(url, {headers: headers***REMOVED***
***REMOVED***

    return Resource;
  }
])

// A "private" service providing a constructor for endpoints.
.factory('_KoastEndpoint', [

  function () {
    'use strict';

    // The constructor.
    function Endpoint(prefix, handle, template) {
      var endpoint = this;
      endpoint.prefix = prefix;
      endpoint.handle = handle;
      endpoint.template = template;
    }

    // A method to generate the post url - that is, a URL that does not
    // identify a specific resource.
    Endpoint.prototype.makePostUrl = function () {
      return this.prefix + this.handle;
***REMOVED***

    // An auxiliary function to generate the part of the URL that identifies
    // the specific resource.
    function makeResourceIdentifier(template, params) {
      if (!params) {
        return '';
***REMOVED*** else {
        return template.replace(/:([-_a-zA-Z]*)/g, function (_, paramName) {
          var param = params[paramName];
          var paramIsDefined = param || (param===0); // Accept 0 as "defined".
          if (!paramIsDefined) {
            throw new Error('Missing parameter: ' + paramName);
  ***REMOVED***
          return params[paramName];
    ***REMOVED***
***REMOVED***
    }

    // A method to generate a URL for get, put or delete - that is, a URL that
    // identies a particular resource. This URL would not include the query
    // string, since $http will attach that for us.
    Endpoint.prototype.makeGetUrl = function (params) {
      return this.makePostUrl() + '/' + makeResourceIdentifier(this.template,
        params);
***REMOVED***

    // The service instance is actually going to be a constructor function.
    return Endpoint;
  }
])

// A service that offers high level methods for interacting with resources.
.factory('_koastResourceGetter', ['_KoastResource', '_KoastServerHelper',
  '_KoastEndpoint', '$http', '$q', '$log',
  function (KoastResource, KoastServerHelper, KoastEndpoint, $http, $q, $log) {
    'use strict';
    var service = {};
    var prefix;
    var endpoints = {};

    // An auxiliary function that actually gets the resource. This should work
    // for either a request to get a single item or a query for multiple.
    function get(endpointHandle, params, query, options) {
      var deferred = $q.defer();
      var endpoint = endpoints[endpointHandle];
      var headers = {};

      options = options || {};
      if (!endpoint) {
        throw new Error('Unknown endpoint: ' + endpointHandle);
***REMOVED***

      KoastServerHelper.addAuthHeaders(headers);

      $http.get(endpoint.makeGetUrl(params), {
        params: query,
        headers: headers
***REMOVED***)
        .success(function (result) {
          var resources = [];
          result.forEach(function (result) {
            var resource = new KoastResource(endpoint, result);
            resources.push(resource);
      ***REMOVED***

          if (options.singular) {
            if (resources.length === 0) {
              return null;
***REMOVED*** else if (resources.length > 1) {
              $log.warn('Expected a singular resource, got ' + resources.length);
***REMOVED***
            deferred.resolve(resources[0]);
  ***REMOVED*** else {
            deferred.resolve(resources);
  ***REMOVED***
***REMOVED***)
        .error(function (error) {
          deferred.reject(error);
    ***REMOVED***
      return deferred.promise;
    }

    // Sets the prefix for API URLs. For now we can only set one.
    service.setApiUriPrefix = function (newPrefix) {
      prefix = newPrefix;
***REMOVED***

    /**
     * Gets a single resource. This should be used when we want to retrieve
     * a specific resource.
     *
     * @param  {String} endpointHandle    A string identifying the endpoint.
     * @param  {Object} params            An object identifying a specific
     *                                    resource.
     * @return {promise}                  A $q promise that resolves to
     *                                    specific resource (or null if not
     *                                    found).
     */
    service.getResource = function (endpointHandle, params) {
      return get(endpointHandle, params, null, {
        singular: true
  ***REMOVED***
***REMOVED***


    function post(endpointHandle, data, options) {
      var deferred = $q.defer();
      var endpoint = endpoints[endpointHandle];
      var headers = {};

      options = options || {};
      if (!endpoint) {
        throw new Error('Unknown endpoint: ' + endpointHandle);
***REMOVED***

      KoastServerHelper.addAuthHeaders(headers);

      $http.post(endpoint.makePostUrl(), data, {
        headers: headers
***REMOVED***)
        .success(function (result) {
          deferred.resolve(result);
***REMOVED***)
        .error(function (error) {
          deferred.reject(error);
    ***REMOVED***
      return deferred.promise;
    }


    service.createResource = function (endpointHandle, body) {
      return post(endpointHandle, body)
        .then(function(result) {
          console.log(result);
          return result;
  ***REMOVED*** $log.error);
***REMOVED***

    /**
     * Queries for resource. This should be used when we want to get a list of
     * resources that satisfy some criteria.
     *
     * @param  {String} endpointHandle    A string identifying the endpoint.
     * @param  {Object} query             A query object.
     * @return {promise}                  A $q promise that resolves to a list
     *                                    of resources.
     */
    service.queryForResources = function (endpointHandle, query) {
      return get(endpointHandle, null, query);
***REMOVED***

    service.addEndpoint = function (handle, template) {
      var endpoint = new KoastEndpoint(prefix, handle, template);
      if (endpoints[handle]) {
        throw new Error('An endpoint with this handle was already defined: ' +
          handle);
***REMOVED***
      endpoints[handle] = endpoint;
***REMOVED***

    return service;
  }
]);

/* global angular */

angular.module('koast-user', [])

// Abstracts out some OAuth-specific logic.
.factory('_koastOauth', ['$window', '$location', '$log',
  function ($window, $location, $log) {
    'use strict';

    var service = {};

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
      return baseUrl + endPoint;
***REMOVED***

    return service;
  }
])

// A service that represents the logged in user.
.factory('_koastUser', ['_koastOauth', '$log', '$timeout', '$http', '$window', '$q',
  function (koastOauth, $log, $timeout, $http, $window, $q) {
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
    var authenticatedDeferred = $q.defer();

    // Sets the user's data and meta data, for social login
    // Returns true if the user is authenticated.
    function setUser(response) {
      var newUser = response.data;
      // Figure out if the user is signed in. If so, update user.data and
      // user.meta.
      if (newUser.isAuthenticated) {
        user.data = newUser.data;
        user.meta = newUser.meta;
        authenticatedDeferred.resolve();
***REMOVED***
      user.isAuthenticated = newUser.isAuthenticated;
      return newUser.isAuthenticated;
    }

    // Sets the user's data and meta data, for local login
    // Returns true if the user is authenticated.
    function setUserForLocal(response) {
      if (response.data && response.data.username) {
        user.data = response.data;
        user.isAuthenticated = true;
        authenticatedDeferred.resolve();
        user.meta = response.meta;
***REMOVED*** else {
        user.data = {};
        user.isAuthenticated = false;
***REMOVED***
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
      return $http.get(url || koastOauth.makeRequestURL('/auth/user'))
        .then(setUser)
        .then(callRegistrationHandler)
        .then(function(isAuthenticated) {
          user.isReady = true;
          if (isAuthenticated) {
            authenticatedDeferred.resolve();
  ***REMOVED***
          return isAuthenticated;
***REMOVED***)
        .then(null, $log.error);
    }

    // Initiates the login process.
    user.initiateOauthAuthentication = function (provider) {
      koastOauth.initiateAuthentication(provider);
***REMOVED***
    
    // Posts a logout request.
    user.logout = function (nextUrl) {
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
      var config = {
        params: {
          username: user.username,
          password: user.password
***REMOVED***
***REMOVED***;
      return $http.post(koastOauth.makeRequestURL('/auth/login'), {}, config)
        .then(setUserForLocal);
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
      return $http.get(koastOauth.makeRequestURL('/auth/usernameAvailable'), {
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

    // Returns a promise that resolves when the user is authenticated.
    user.whenAuthenticated = function() {
      return authenticatedDeferred.promise;
***REMOVED***

    return user;
  }
]);