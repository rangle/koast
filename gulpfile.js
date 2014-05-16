var gulp = require('gulp');
var rg = require('rangle-gulp');

var karmaVendorFiles = [
  'client/bower_components/angular/angular.min.js',
  'client/bower_components/angular-mocks/angular-mocks.js',
  'client/bower_components/sinon-chai/lib/sinon-chai.js',
  'client/testing/lib/*.js'
];

var karmaFiles = [
  'client/src/**/*.js'
];

rg.setLogLevel('info');

gulp.task('karma', rg.karma({
  files: karmaFiles,
  vendor: karmaVendorFiles
}));

gulp.task('karma-ci', rg.karma({
  files: karmaFiles,
  vendor: karmaVendorFiles,
  karmaConf: 'client/testing/karma-ci.conf.js'
}));

gulp.task('karma-watch', rg.karmaWatch({
  files: karmaFiles,
  vendor: karmaVendorFiles
}));

gulp.task('mocha', rg.mocha());

gulp.task('lint', rg.jshint({
  files: [
    'client/src/**/*.js',
    'server/lib/**/*.js',
    'server/index.js',
    'examples/basic-express/client/app/app.js',
    'examples/basic-express/client/app/**/*.js',
    'examples/basic-express/server/app.js',
    'examples/basic-express/server/**/*.js'
  ]
}));

gulp.task('beautify', rg.beautify({
  files: []
}));

gulp.task('concat', rg.concatAndUglify({
  files: 'client/src/**/*.js',
  name: 'koast',
  dist: 'client/dist/'
}));

gulp.task('dev', rg.nodemon({
  // workingDirectory: 'examples/basic-express/',
  script: 'examples/basic-express/server/app.js',
  onChange: ['lint'] // or ['lint', 'karma']
}));

gulp.task('test', ['karma', 'mocha']);

gulp.task('default', ['lint', 'concat', 'mocha', 'karma']);