/** @module koast/mailer */
'use strict';

var nodemailer = require('nodemailer'),
  _ = require('underscore'),
  fs = require('fs'),
  Q = require('q'),
  path = require('path'),
  config = require('../config');

var log = require('../log');

/**
 * TODO
 *
 * @param {Object} passedConfigFilename TODO
 * @returns {promise} TODO promise of sorts
 */
exports.mailerMaker = function(passedConfigFilename) {
  var configFilename = passedConfigFilename || 'mailer';

  var mailerConfig = config.getConfig(configFilename, true),
    smtp;

  if (mailerConfig) {
    smtp = nodemailer.createTransport('SMTP', mailerConfig.smtp);
  }

  return {
    sendMail: function(mailObj, cb) {
      smtp.sendMail(mailObj, cb);
    },
    smtp: smtp,
    initEmail: function(options) {
      var deferred = Q.defer();

      mailerConfig = config.getConfig(configFilename, true);
      var htmlFilePath = path.dirname(require.main.filename) + mailerConfig.htmlPath;
      if (mailerConfig.useHtml) {
        fs.readFile(htmlFilePath, 'utf8', function(err, data) {
          if (err) {
            log.debug('Error loading html: ' + err);
            deferred.reject(err);
  ***REMOVED*** else {
            log.debug('Loading html: ' + data);
            mailerConfig.email.html = data;
            mailerConfig.email.text = undefined;
            deferred.resolve(_.extend(mailerConfig.email, options));
  ***REMOVED***
          
    ***REMOVED***
***REMOVED*** else {
        log.debug('Using text as mail');
        deferred.resolve(_.extend(mailerConfig.email, options));
***REMOVED***
      return deferred.promise;
    }
  };
};
