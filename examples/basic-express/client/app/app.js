/* angular */

angular.module('sampleKoastClientApp', ['koast'])

.controller('myCtrl', ['$scope', 'koast', function($scope, koast) {
  'use strict';

  $scope.robotStatus = {};

  // Saves a robot upon button click.
  $scope.saveRobot = function(robot) {
    robot.save()
      .then(function(response) {
        $scope.robotStatus[robot.robotNumber] = 'Success!';
***REMOVED*** function(error) {
        $scope.robotStatus[robot.robotNumber] = 'Oops...';
  ***REMOVED***
  };

  // Request one robot from the server.
  koast.getResource('robots', {robotNumber: 1})
    .then(function(robot) {
      $scope.myRobot = robot;
***REMOVED***

  // Request all robots from the server.
  koast.queryForResources('robots')
    .then(function(robots) {
      $scope.robots = robots;
***REMOVED***

}])

.run(['koast', function(koast) {
  'use strict';
  koast.setApiUriPrefix('http://localhost:3000/api/');
  koast.addEndpoint('robots', ':robotNumber');
}]);