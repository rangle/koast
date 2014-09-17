/* global require, exports, process */

'use strict';

var winston = require('winston');
var _ = require('underscore');
var levels;
var colors;
var logLevel;

levels = {
  debug: 1,
  verbose: 2,
  info: 3,
  warn: 4,
  error: 5,
  event: 6,
  failure: 7
};

colors = {
  debug: 'grey',
  verbose: 'magenta',
  info: 'cyan',
  warn: 'yellow',
  error: 'red',
  event: 'white',
  failure: 'red'
};

var logLevel = process.env.LOG_LEVEL || 'verbose';

var logger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)({
      colorize: true,
      level: logLevel
    })
  ],
  levels: levels,
  colors: colors
***REMOVED***

exports.setLevel = function (level) {
  // Do nothing for now.
};

_.keys(levels).forEach(function (level) {
  exports[level] = logger[level];
***REMOVED***
