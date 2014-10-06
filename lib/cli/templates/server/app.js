'use strict';

var koast = require('koast');
koast.config.loadConfiguration(); // Default to NODE_ENV or 'local'
koast.config.whenReady(koast.serve);