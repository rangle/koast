var supertest = require('supertest');
var express = require('express');
var multer  = require('multer');
var expect = require('chai').expect;

var s3upload = require('./s3upload');
var config = require('../config');

describe('Test', function() {
  before(function() {
    config.setConfigDirectory(process.cwd() + '/test-data', {
      force: true
    });
    return config.loadConfiguration('test', {
      force: true
    });
  });

  it('Should test.', function(done) {

    var awsconf = {
      global: {
        accessKeyId: 'ACCESSKEY',
        secretAccessKey: 'SECRETKEY'
      },

      s3: {
        bucket: 'BUCKET',

        makeKey:  function() {
          return 'filename';
        },

        respond: function (req, res, key) {
          res.send(200, {
            file: {
              url: 'https://s3.amazonaws.com/BUCKET/' + key
            }
          });
        }
      }
    };

    var fpath = process.cwd() + '/test-data/static-test/koast.txt';

    var uploader = s3upload.makeS3FileUploader(awsconf.global, awsconf.s3);

    var app = express();
    app.use(multer());
    app.post('/x', uploader);

    supertest(app)
      .post('/x')
      .attach('attachments', fpath)
      .end(function(err, res) {
        var url = JSON.parse(res.text).file.url;
        expect(url).to.equal('https://s3.amazonaws.com/BUCKET/filename');

        supertest('http://STATICHOST.URL')
          .get('/filename')
          .expect(200)
          .end(function(err, res) {
            expect(res.text).to.equal('koast\n');
            done(err);
          });
      });

  });
});
