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
    function Resource(endpoint, result, options) {
      var resource = this;
      var data;
      if (options.useEnvelope) {
        data = result.data;
        if (!data) {
          throw new Error('Client expects an envelope, but server did not send it properly.');
***REMOVED***
***REMOVED*** else {
        data = result;
***REMOVED***
      _.keys(data).forEach(function (key) {
        resource[key] = data[key];
  ***REMOVED***

      if (options.useEnvelope) {
        Object.defineProperty(this, 'can', {
          get: function () {
            return result.meta.can;
  ***REMOVED***
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
    function Endpoint(prefix, handle, template, options) {
      var endpoint = this;
      endpoint.prefix = prefix;
      endpoint.handle = handle;
      endpoint.template = template;
      endpoint.options = _.clone(options);
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
    var prefixes = {};
    var endpoints = {};

    // An auxiliary function that actually gets the resource. This should work
    // for either a request to get a single item or a query for multiple.
    function get(endpointHandle, params, query, resourceOptions) {
      var deferred = $q.defer();
      var endpoint = endpoints[endpointHandle];
      var headers = {};
      var options = {};
      options = angular.extend(options, endpoint.options);
      options = angular.extend(options, resourceOptions);
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
            var resource = new KoastResource(endpoint, result, options);
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

    // Sets the prefix for API URLs. The prefix can be optionally associated
    // with a server handle. If no handle is specified, this method sets API
    // URL prefix for the default server.
    service.setApiUriPrefix = function (newPrefix, serverHandle) {
      serverHandle = serverHandle || '_';
      prefixes[serverHandle] = newPrefix;
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
        .then(null, $log.error);
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

    service.addEndpoint = function (handle, template, options) {
      options = options || {};
      var serverHandle = options.server || '_';
      var prefix = prefixes[serverHandle];
      if (!prefix) {
        throw new Error('No URI prefix defined for server ' + serverHandle);
***REMOVED***
      var endpoint = new KoastEndpoint(prefix, handle, template, options);
      if (endpoints[handle]) {
        throw new Error('An endpoint with this handle was already defined: ' +
          handle);
***REMOVED***
      endpoints[handle] = endpoint;
***REMOVED***

    return service;
  }
]);
