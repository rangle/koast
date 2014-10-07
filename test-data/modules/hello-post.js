'use strict';

//
// THEY CREATE AND PASS ROUTER
var express = require('express');
var router = express.Router();

router.post('/world', function(req, res) {
  res.send('Hello, post!');
});

router.get('/world', function(req, res) {
  res.send('Hello, get!');
});


module.exports = exports = {
  koastModule: {
    router: router
  }
};

