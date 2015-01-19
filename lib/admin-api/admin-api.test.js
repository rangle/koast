/* jshint expr:true */
/* global require, describe, it, before, after, beforeEach, process */
'use strict';

var q = require('q');
var _ = require('underscore');
var log = require('koast-logger');
var express = require('express');
var supertest = require('supertest');
var expect = require('chai').expect;

var adminApi = require('./admin-api');

//
//var targetMongoUri = 'mongodb://localhost:27017/koast1';
//
/*var access = process.env.AWS_ACCESS;
var secret = process.env.AWS_SECRET;
var bucket = process.env.AWS_S3_BUCKET;*/

var adminConfig = {
  aws: {
    key: process.env.AWS_ACCESS,
    secret: process.env.AWS_SECRET
  },

  local: {
    backupPath: '/tmp/backups/'
  },

  backups: {
    target: 'mongodb://localhost:27017/koast-to-do-application' //Database to backup
  },

  database: { //Database usennpd to store admin metadata
    url: 'mongodb://localhost:27017/koast_db'
  }
};
var adminModule;

xdescribe('Admin api tests', function() {
  before(function() {
    adminModule = adminApi.genKoastModule(adminConfig);
  });

  it('should create a backup record if backup is successful', function(done) {

  });
});

