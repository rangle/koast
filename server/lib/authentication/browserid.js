/* global exports */

var https = require('https');
var querystring = require('querystring');
var log = require('../log');

function makeVerifierRequest(body, callback) {
  var request = https.request({
    host: 'verifier.login.persona.org',
    path: '/verify',
    method: 'POST'
  }, callback);
  request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
  body = querystring.stringify(body);
  request.setHeader('Content-Length', body.length);
  request.write(body);
  request.end();
}

exports.makeAuthenticator = function (userLookupFunction) {

  return function browserIdAuthenticator(req, res) {
    console.log('/auth/browserid');
    makeVerifierRequest({
        assertion: req.body.assertion,
        audience: req.body.audience
***REMOVED***
      function handleVerifierResponse(verifierResponse) {
        var body = '';
        verifierResponse
          .on('data', function (chunk) {
            body += chunk;
  ***REMOVED***)
          .on('end', function () {
            var json;
            try {
              json = JSON.parse(body);
              if (json && json.status==='okay') {
                userLookupFunction(json.email)
                  .then(function(result) {
                    if (result.valid) {
                      console.log('user:', result.user);
                      res.send(200, result.user);                      
        ***REMOVED*** else {
                      res.send(401, 'Access denied.');
        ***REMOVED***
              ***REMOVED***
  ***REMOVED*** else {
                res.send(401, 'Persona assertion verification failed.');
  ***REMOVED***
***REMOVED*** catch (e) {
              log.error('Persona authentication error: ' + e.toString());
              log.error(e.stack);
              res.send(500, 'Oops: ' + e.toString());
***REMOVED***
      ***REMOVED***
  ***REMOVED***
    console.log('verifying assertion!');
  }
}