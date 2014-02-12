/* angular, _ */

angular.module('koast', [])

// The main airbender service exposed to the developer.
.factory('koast', ['$q', '$http',
  function ($q, $http) {
    'use strict';
    var service = {};
    var prefix;
    var models = {};

    // A client side representation of a RESTful resource.
    function Resource(modelName, result) {
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
      Object.defineProperty(this, 'model', {
        get: function() {
          return {
            name: modelName
  ***REMOVED***;
***REMOVED***
  ***REMOVED***
      return this;
    }

    // Saving the resource
    Resource.prototype.save = function() {
      var url ;

      var model = models[this.model.name];
      if (!model) {
        throw new Error('Unknown model:', this.model.name);
***REMOVED***
      url = prefix + model.makeUrl(this);
      console.log('url:', url);
      console.log('body:', this);
      return $http.put(url, this);
***REMOVED***

    // An auxiliary function that actually "gets" the resource.
    function get (modelName, params, query) {
      var deferred = $q.defer();
      var url = prefix + modelName;
      $http.get(url, {params: query})
        .success(function (result) {
          var resources = [];
          result.forEach(function(result) {
            var resource = new Resource(modelName, result);
            resources.push(resource);
      ***REMOVED***
          deferred.resolve(resources);
***REMOVED***)
        .error(function(error) {
          deferred.reject(error);
    ***REMOVED***
      return deferred.promise;
***REMOVED***

    service.setApiUriPrefix = function (newPrefix) {
      prefix = newPrefix;
***REMOVED***

    service.getResource = function (modelName, params, query) {
      return get(modelName, params, query);
***REMOVED***

    service.registerModel = function (modelName, template) {
      var model = {};
      models[modelName] = model;

      model.makeUrl = function(params) {
        return template.replace(/:([a-zA-Z]*)/g, function(_, paramName) {
          var param = params[paramName];
          if (!param) {
            throw new Error('Missing parameter: ' + paramName);
  ***REMOVED***
          return params[paramName];
    ***REMOVED***
***REMOVED***;
***REMOVED***

    return service;
  }
]);