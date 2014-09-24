'use strict';

var koast = require('koast');
koast.config.setEnvironment(); // Default to NODE_ENV or 'local'
koast.serve();
