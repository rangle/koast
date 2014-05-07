var gulp = require('gulp');
var rg = require('rangle-gulp');

gulp.task('karma', rg.karma({
  files: [
    // 3rd party
    'client/bower_components/angular/angular.min.js',
    'client/bower_components/angular-mocks/angular-mocks.js',
    'client/bower_components/sinon-chai/lib/sinon-chai.js',
    // Our code
    'client/src/**/*.js'
  ]
}));

gulp.task('karma-watch', rg.karmaWatch({
  // files: specify which folders
  // karmaConf: specify which karma config file
}));

gulp.task('lint', rg.jshint({
  // files: specify which files
}));

gulp.task('beautify', rg.beautify({
  // files: specify which files
}));

gulp.task('dev', rg.nodemon({
  onChange: ['lint'] // or ['lint', 'karma']
}));

gulp.task('default', ['lint']);