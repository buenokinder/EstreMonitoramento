
app.controller('MapaController', ['$scope','$http', function($scope,$http){
  
console.log('Foi');
    $scope.aterros = [];
    $scope.loadAterros = function() {
        console.log('Init Mapa');
        return $http.get('/Aterro?where={"gerente": "' + window.SAILS_LOCALS._csrf  + '"}').success(function(data) {
            $scope.aterros = data;
        });
    };
    $scope.aterro = {};
    $scope.uploadData = {
        id: ''
      };

}]);
