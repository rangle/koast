var gulp = require('gulp');
var jshint = require('gulp-jshint');
var beautify = require('gulp-beautify');

var paths = {
  clientScripts: ['client/app/**/*.js', 'client/app/*.js'],
  serverScripts: ['server/app.js', 'server/lib/**/*.js']
};

var options = {};

paths.allScripts = paths.clientScripts.concat(paths.serverScripts);

options.beautify = {
  braceStyle: "collapse",
  breakChainedMethods: false,
  e4x: false,
  evalCode: false,
  indentChar: " ",
  indentLevel: 0,
  indentSize: 2,
  indentWithTabs: false,
  jslintHappy: true,
  keepArrayIndentation: false,
  keepFunctionIndentation: false,
  maxPreserveNewlines: 10,
  preserveNewlines: true,
  spaceBeforeConditional: true,
  spaceInParen: false,
  unescapeStrings: false,
  wrapLineLength: 80
};


gulp.task('lint', function() {
  gulp.src(paths.allScripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
***REMOVED***

gulp.task('beautify', function() {
  gulp.src(paths.allScripts)
    .pipe(beautify(options.beautify))
    .pipe(gulp.dest('./public'))
***REMOVED***

gulp.task('default', ['lint']);
