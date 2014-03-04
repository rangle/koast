/* global angular, window */

angular.module('sampleKoastClientApp', ['koast'])

.controller('myCtrl', ['$scope', 'koast', '$timeout',
  function ($scope, koast, $timeout) {
    'use strict';

    // Attach the user service to the scope.
    $scope.user = koast.user;

    // Set the registration handler for the user. That will get fired when
    // we've got a new user that needs to be registered.
    koast.user.setRegistrationHanler(function () {
      var username;
      username = koast.user.data.email.split('@')[0];
      username += '-' + Math.floor(Math.random() * 10000);
      $timeout(function () {
        window.alert('You need a username. We picked "' + username + '"');
        koast.user.data.username = username;
***REMOVED*** 1);
***REMOVED***

    // Add sign in and sign out functions.
    $scope.signIn = function () {
      // Maybe do something before starting sign in.
      koast.user.signIn();
***REMOVED***
    $scope.signOut = function () {
      // Maybe do something before signing the user out.
      koast.user.signOut();
***REMOVED***

    // Now onto robots, which is our data.
    $scope.robotStatus = {};

    // Saves a robot upon button click.
    $scope.saveRobot = function (robot) {
      robot.save()
        .then(function (response) {
          $scope.robotStatus[robot.robotNumber] = 'Success!';
  ***REMOVED*** function (error) {
          $scope.robotStatus[robot.robotNumber] = 'Oops:' + error.toString();
    ***REMOVED***
***REMOVED***

    // Request one robot from the server.
    koast.getResource('robots', {
      robotNumber: 1
    })
      .then(function (robot) {
        $scope.myRobot = robot;
  ***REMOVED***

    // Request all robots from the server.
    koast.queryForResources('robots')
      .then(function (robots) {
        $scope.robots = robots;
  ***REMOVED***

  }
])

.run(['koast', '$log',
  function (koast, $log) {
    'use strict';
    $log.info('Koast:', koast);
    koast.init({
      siteTitle: 'App Awesome'
***REMOVED***
    koast.setApiUriPrefix('http://localhost:3000/api/');
    koast.addEndpoint('robots', ':robotNumber');
  }
]);