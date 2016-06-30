
app.controller('MapaController', ['$scope','$http', function($scope,$http){
  
console.log('Foi');
    $scope.aterros = [];
    $scope.mapas = [];
    $scope.loadAterros = function() {
        return $http.get('/Aterro?where={"gerente": "' + window.SAILS_LOCALS._csrf  + '"}').success(function(data) {
            $scope.aterros = data;
        });
    };

    $scope.buscarMapas = function(id) {   

    	//$scope.uploadData.id = id;
        return $http.get('/Mapa?where={"aterro": "' + id  + '"}').success(function(data) {
            $scope.mapas = data;
        });
    };

    $scope.aterro = {};
    $scope.uploadData = {
        id:  'teasddda'
    };

}]);
