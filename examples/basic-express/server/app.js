'use strict';

var koast = require('koast');
koast.config.loadConfiguration().then(koast.serve) // Default to NODE_ENV or 'local'
