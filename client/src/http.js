/* global angular */

angular.module('koast.http', [])

.factory('_koastTokenKeeper', ['$log', '$window',
  function($log, $window) {
    var TOKEN_KEY = 'KoastToken';
    var service = {};
    service.saveToken = function(params) {
      var tokenValue = params.token;
      $window.localStorage.setItem(TOKEN_KEY, tokenValue);
***REMOVED***
    service.loadToken = function() {
      return $window.localStorage.getItem(TOKEN_KEY);
***REMOVED***
    service.clear = function() {
      return $window.localStorage.removeItem(TOKEN_KEY);
***REMOVED***
    return service;
  }
])

// Abstracts server interaction.
.factory('_koastHttp', ['$http', '$q', '_koastLogger', '_koastTokenKeeper',
  function ($http, $q, _koastLogger, _koastTokenKeeper) {
    var log = _koastLogger.makeLogger('koast.http');
    var service = {};
    var options = {
      timeout: 30000 // 30 seconds
***REMOVED***
    var token = _koastTokenKeeper.loadToken();

    log.debug('Loaded token', token);

    service.setOptions = function(newOptions) {
      options = newOptions;
***REMOVED***

    function addTokenHeader() {
      options.headers = options.headers || {};
      if (token) {
        options.headers['Authorization'] =  'Bearer ' + token;
***REMOVED***
    }

    service.saveToken = function (tokenData) {
      token = tokenData.token;
      _koastTokenKeeper.saveToken(tokenData);
***REMOVED***

    service.deleteToken = function (tokenData) {
      _koastTokenKeeper.clear();
***REMOVED***

    function whenAuthenticated() {
      // ::todo
      return $q.when();
    }

    // Sandwiches a call to the server inbetween checking for things like
    // authentication and post-call error checking.
    function makeServerRequest(caller) {
      return whenAuthenticated()
        // .then(function() {
        //   if (!networkInformation.isOnline) {
        //     throw 'offline';
        //   }
        // })
        .then(function() {
          addTokenHeader();
***REMOVED***)
        .then(caller)
        .then(function(response) {
          service.isReachable = true;
          return response.data? response.data: response;
***REMOVED***)
        .then(null, function(err) {
          log.warn(err.data || err);
          throw err;
    ***REMOVED***
        // .then(null, function(error) {
        //   error = checkErrors(error);
        //   throw error.data? error.data: error;
        // ***REMOVED***
    }

    service.get = function(url, params) {
      return makeServerRequest(function() {
        var config = _.cloneDeep(options);
        config.url = options.baseUrl + url;
        config.params = params;
        config.method = 'GET';
        return $http(config);
  ***REMOVED***
***REMOVED***

    return service;
  }
]);
