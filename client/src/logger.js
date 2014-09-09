/* global angular */

// Logging with a few extra bells and whistles.
angular.module('koast.logger', [])
  .factory('_koastLogger', [
    function() {

      var service = {};
      service.levels = {
        debug: 1,
        verbose: 2,
        info: 3,
        warn: 4,
        error: 5
***REMOVED***;
      var logLevel = 3;
      service.colors = {};
      service.setLogLevel = function(newLevel) {
        logLevel = newLevel;
***REMOVED***;

      function log(options, groupOptions, values) {
        options = arguments[0] || {};

        if (options.level && options.level < logLevel) {
          return;
***REMOVED***;

        var color = options.color || 'black';
        var args = [];
        var noMoreColors = false;
        values = Array.prototype.slice.call(values, 0);
        var colored = [];
        if (typeof values[0] === 'string') {
          colored.push('%c' + values.shift());
          args.push('color:' + color + ';');
***REMOVED***

        if (groupOptions.groupName) {
          colored.unshift('%c[' + groupOptions.groupName + ']');
          args.unshift('color:gray;');
***REMOVED***
        if (options.symbol) {
          colored.unshift('%c' + options.symbol);
          args.unshift('color:' + color + ';font-weight:bold;font-size:150%;');
***REMOVED***
        args.unshift(colored.join(' '));
        args = args.concat(values);
        Function.prototype.apply.call(console.log, console, args);
***REMOVED***

      function makeLoggerFunction(options) {
        options.level = service.levels[options.name];
        return function(groupOptions, args) {
          log(options, groupOptions, args);
***REMOVED***
***REMOVED***

      var logFunctions = {
        debug: makeLoggerFunction({
          name: 'debug',
          color: 'gray',
          symbol: '✍'
***REMOVED***),
        verbose: makeLoggerFunction({
          name: 'verbose',
          color: 'cyan',
          symbol: '☞'
***REMOVED***),
        info: makeLoggerFunction({
          name: 'info',
          color: '#0074D9',
          symbol: '☞'
***REMOVED***),
        warn: makeLoggerFunction({
          name: 'warn',
          color: 'orange',
          symbol: '⚐'
***REMOVED***),
        error: makeLoggerFunction({
          name: 'error',
          color: 'red',
          symbol: '⚑'
***REMOVED***),
***REMOVED***;

      var methodNames = ['debug', 'verbose', 'info', 'warn', 'error'];

      service.makeLogger = function (options) {
        var logger = {};
        if (typeof options === 'string') {
          options = {
            groupName: options
  ***REMOVED***;
***REMOVED***
        logger.options = options;
        methodNames.forEach(function(methodName) {
          logger[methodName] = function() {
            var args = arguments;
            return logFunctions[methodName](logger.options, args);
  ***REMOVED***
    ***REMOVED***

        return logger;
***REMOVED***

      var defaultLogger = service.makeLogger({***REMOVED***

      methodNames.forEach(function(methodName) {
        service[methodName] = defaultLogger[methodName];
  ***REMOVED***

      return service;
    }
  ]);