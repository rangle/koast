'use strict';

var express = require('express');
var router = express.Router();

router.use('/world', function(req, res) {
  res.send('Hello, koast!');
});

module.exports = exports = {
  koastModule: {
    router: router
  }
};
