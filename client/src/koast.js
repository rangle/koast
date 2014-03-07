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