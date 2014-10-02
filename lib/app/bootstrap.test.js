/* jshint expr:true */
/* global require, describe, it, before, after */

'use strict';

var Q = require('q');
var chai = require('chai');
var should = chai.should();
***REMOVED***
var bootstrap = require('./bootstrap');

describe('Bootstrapper can load', function () {
  it('Should mount HW module and have route /hello/world.', function (done) {
    var app = bootstrap.getConfiguredApplication({
      routes: [{
        route: '/hello',
        type: 'module',
        module: 'test-data/modules/hello-world'
***REMOVED***]
***REMOVED***

***REMOVED***
      .get('/hello/world')
      .end(function (err, res) {
        res.text.should.equal('Hello, koast!');
        done(err);
  ***REMOVED***
***REMOVED***

  it('Should serve static files.', function (done) {
    var app = bootstrap.getConfiguredApplication({
      routes: [{
        route: '/hello',
        type: 'static',
        path: 'test-data/static-test'
***REMOVED***]
***REMOVED***

***REMOVED***
      .get('/hello/koast.txt')
      .end(function (err, res) {
        if (err) {
          throw err;
***REMOVED***
        res.text.should.equal('koast\n');
        done(err);
  ***REMOVED***
***REMOVED***


***REMOVED***

describe('Methods respond properly', function () {
  it('Should allow POST and GET.', function (done) {
    var app = bootstrap.getConfiguredApplication({
      routes: [{
        route: '/hello',
        type: 'module',
        module: 'test-data/modules/hello-post'
***REMOVED***]
***REMOVED***

    var d1 = Q.defer();
***REMOVED***
      .get('/hello/world')
      .end(function (err, res) {
        if (err) {
          done(err);
***REMOVED***
        res.text.should.equal('Hello, get!');
        d1.resolve();
  ***REMOVED***


    var d2 = Q.defer();
***REMOVED***
      .post('/hello/world')
      .end(function (err, res) {
        if (err) {
          done(err);
***REMOVED***
        res.text.should.equal('Hello, post!');
        d2.resolve();
  ***REMOVED***

    return Q.all([d1, d2])
      .then(function () {
        done();
  ***REMOVED***
***REMOVED***
***REMOVED***
