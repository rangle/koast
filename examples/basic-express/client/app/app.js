/* angular */

angular.module('sampleKoastClientApp', ['koast'])
.controller('myCtrl', ['$scope', 'koastResource', function($scope, koastResource) {
  console.log('Foo');
  $scope.rename = function() {
    console.log($scope.robots[0]);
    $scope.robots[0].robotName = 'Marvin';
    $scope.robots[0].save();
  }
  koastResource.get('http://localhost:3000/api/robots')
    .then(function(robots) {
      console.log('Foo');
      console.log(robots);
      $scope.robots = robots;
    })
}]);