/* angular, _ */

angular.module('koast', [])

// The main airbender service exposed to the developer.
.factory('koastResource', ['$q', '$http',
  function ($q, $http) {
    'use strict';
    var service = {};

    function Resource(result) {
      var that = this;
      // this.__can = result.meta.can;
      _.keys(result.data).forEach(function(key) {
        console.log('key', key);
        that[key] = result.data[key];
  ***REMOVED***

      Object.defineProperty(this, 'can', {
        get: function() {
          return result.meta.can;
***REMOVED***
  ***REMOVED***

      return this;
    }

    Resource.prototype.save = function() {

      console.log(this._id, _.keys(this));
    }
    // Object.defineProperty(Resource.prototype, 'can', {
    //   get: function() {
    //     return this.__can;
    //   }
    // })

    service.get = function(url) {
      var deferred = $q.defer();
      $http.get(url)
        .success(function (result) {
          var resources = [];
          result.forEach(function(result) {
            var resource = new Resource(result);
            resources.push(resource);
      ***REMOVED***
          deferred.resolve(resources);
***REMOVED***)
        .error(function(error) {
          deferred.reject(error);
    ***REMOVED***
      return deferred.promise;
***REMOVED***
    return service;
  }
]);