app.controller('PiezometroController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.data = {
    nivelAtencao:0,
    nivelAceitavel:0,
    nivelRegular:0,
    nivelIntervencao:0,
    nivelParalisacao:0
  }
}]);
