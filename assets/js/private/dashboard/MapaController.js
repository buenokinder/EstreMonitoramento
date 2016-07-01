
app.controller('MapaController', ['$scope','$http','$sce', function($scope,$http, $sce){
  
console.log('Foi');
    $scope.aterros = [];
    $scope.mapas = [];
    $scope.loadAterros = function() {
        return $http.get('/Aterro?where={"gerente": "' + window.SAILS_LOCALS._csrf  + '"}').success(function(data) {
            $scope.aterros = data;
        });
    };

    $scope.buscarMapas = function(id) {   

    	$scope.uploadData.id = id;
        return $http.get('/Mapa?where={"aterro": "' + id  + '"}').success(function(data) {
            $scope.mapas = data;
        });
    };
    $scope.selecionarMapa = function(mapa){

        $scope.mapa = mapa;
    }
    $scope.aterro = {};
    $scope.uploadData = {
        id:  'teasddda'
    };
    $scope.mapa = [];
    $scope.getSrc = function() {
        if($scope.mapa){
        var url = "http://localhost:1337/mapas?id=" + $scope.mapa.mapaFile;
        return $sce.trustAsResourceUrl(url);
        }
        return null;
    };

}]);
