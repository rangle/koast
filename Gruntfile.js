module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({

    "jsbeautifier" : {
      files: ['server/lib/*.js', 'server/lib/**/*.js'],
      options : {
        js: {
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
***REMOVED***
***REMOVED***
    },
    "jshint": {
      //all: ['client/app/map/*.js', 'client/app/data/*.js', 'server/js/**/*.js', 'server/scripts/**/*.js'],
      all: ['server/lib/*.js', 'server/lib/**/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        quotmark: 'single',
        '-W097': true,
        //browser: true,
        globals: {
          require: true,
          exports: true,
          process: true
***REMOVED***
***REMOVED***
    }
***REMOVED***
};
