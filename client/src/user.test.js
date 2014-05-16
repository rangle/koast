/* globals describe, it, chai, console */

'use strict';
var expect = chai.expect;

describe('_koastOauth', function() {
  testMakeRequestUrl('http://alertsmd.com');
***REMOVED***

describe('_koastOauth', function() {
  // This tests the baseUrl logic
  testMakeRequestUrl('http://alertsmd.com/foo/booo/1234');
***REMOVED***

function testMakeRequestUrl(baseUrl) {

  beforeEach(angular.mock.module('koast-user'));
  beforeEach(module(function($provide) {

    $provide.service('$location', function() {
      var service = {};
      service.absUrl = function() {
        return baseUrl;
***REMOVED***;
      return service;
***REMOVED***
  }));

  it('should make a request url', function() {

    inject(function(_koastOauth) {
      expect(_koastOauth.makeRequestURL()).to.not.be.undefined;
      expect(_koastOauth.makeRequestURL('car')).to.equal('http://alertsmd.com/car');
      expect(_koastOauth.makeRequestURL('/car')).to.equal('http://alertsmd.com//car');
      expect(_koastOauth.makeRequestURL('')).to.equal('http://alertsmd.com/');
      expect(_koastOauth.makeRequestURL()).to.equal('http://alertsmd.com/');
      expect(_koastOauth.makeRequestURL('false')).to.equal('http://alertsmd.com/false');
      expect(_koastOauth.makeRequestURL(null)).to.equal('http://alertsmd.com/');
      expect(_koastOauth.makeRequestURL(false)).to.equal('http://alertsmd.com/');

      var anotherServer = 'http://anotherserver.ca';
      _koastOauth.setBaseUrl(anotherServer);
      expect(_koastOauth.makeRequestURL(false)).to.equal(anotherServer);
      expect(_koastOauth.makeRequestURL('/car')).to.equal(anotherServer + '/car');
      expect(_koastOauth.makeRequestURL('//car')).to.equal(anotherServer + '//car');

***REMOVED***
***REMOVED***
}


describe('_koastOauth', function() {

  var baseUrl = 'http://alertsmd.com/foo/bar';

  beforeEach(angular.mock.module('koast-user'));
  beforeEach(module(function($provide) {

    $provide.service('$location', function() {
      var service = {};
      service.absUrl = function() {
        return baseUrl;
***REMOVED***;
      return service;
***REMOVED***

    $provide.service('$window', function() {
      var service = {};
      service.location = {
        replace: sinon.spy()
***REMOVED***;
      return service;
***REMOVED***
  }));



  it('should initiate authentication', function() {
    inject(function(_koastOauth, $window) {
      var someProvider = 'facebook';
      _koastOauth.initiateAuthentication(someProvider);
      $window.location.replace.should.have.been.calledOnce;
      $window.location.replace.should.have
        .been.calledWith('http://alertsmd.com//auth/' + someProvider + '?next=' + encodeURIComponent(baseUrl));
***REMOVED***
***REMOVED***
***REMOVED***


describe('_koastUser', function() {

  beforeEach(angular.mock.module('koast-user'));

  beforeEach(module(function($provide) {
    $provide.service('$http', function() {
      var service = {};
      var deferred = Q.defer();
      var response = {
        data: {
          username: 'someUsername'
***REMOVED***
***REMOVED***;
      deferred.resolve(response);

      service.post = sinon.spy(function() {
        return deferred.promise;
  ***REMOVED***
      return service;
***REMOVED***
  }));

  it('should login a user using local strategy', function(done) {
    inject(function(_koastUser, $http) {

      _koastUser.loginLocal({
        username: 'someUsername',
        password: 'somePassword'
***REMOVED***)
        .then(function(res) {
          expect(res).to.be.true;
          $http.post.should.have.been.calledOnce;
          done();
***REMOVED***)
        .then(null, done);
***REMOVED***
***REMOVED***
***REMOVED***