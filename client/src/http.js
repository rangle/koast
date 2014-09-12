/* global angular */

angular.module('koast.http', [])

.factory('_koastTokenKeeper', ['$log', '$window',
  function($log, $window) {
    var TOKEN_KEY = 'KoastToken';
    var service = {};
    service.saveToken = function(params) {
      var tokenValue = params.token;
      $window.localStorage.setItem(TOKEN_KEY, tokenValue);
    };
    service.loadToken = function() {
      return $window.localStorage.getItem(TOKEN_KEY);
    };
    service.clear = function() {
      return $window.localStorage.removeItem(TOKEN_KEY);
    };
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
    };
    var token = _koastTokenKeeper.loadToken();

    log.debug('Loaded token', token);

    service.setOptions = function(newOptions) {
      options = newOptions;
    };

    function addTokenHeader() {
      options.headers = options.headers || {};
      if (token) {
        options.headers['Authorization'] =  'Bearer ' + token;
      }
    }

    service.saveToken = function (tokenData) {
      _koastTokenKeeper.saveToken(tokenData);
    };

    service.deleteToken = function (tokenData) {
      _koastTokenKeeper.clear();
    };

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
        })
        .then(caller)
        .then(function(response) {
          service.isReachable = true;
          return response.data? response.data: response;
        })
        .then(null, function(err) {
          log.warn(err.data || err);
          throw err;
        });
        // .then(null, function(error) {
        //   error = checkErrors(error);
        //   throw error.data? error.data: error;
        // });
    }

    service.get = function(url, params) {
      return makeServerRequest(function() {
        var config = _.cloneDeep(options);
        config.url = options.baseUrl + url;
        config.params = params;
        config.method = 'GET';
        return $http(config);
      });
    };

    return service;
  }
]);
