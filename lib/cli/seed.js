var gulp = require('gulp');
var install = require('gulp-install');
var conflict = require('gulp-conflict');
var install = require('gulp-install');

var templateFiles = [__dirname + '/templates/**'];

exports.seed = function() {
  gulp.src(templateFiles)
    .pipe(conflict('./'))
    .pipe(gulp.dest('./'))
    .pipe(install());
};

