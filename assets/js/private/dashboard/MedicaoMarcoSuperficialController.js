

app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', 'sennitCommunicationService',   function($scope, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.medicoes = [];
      $scope.showContent = function($fileContent){

        var linhas = $fileContent.split('\n');
        for(var i = 0;i < linhas.length;i++){
            var linha = linhas[i];
            var colunas = linha.split(';');


            $http.post('/MedicaoMarcoSuperficial', { 'nome': colunas[0] , 'norte': colunas[1], 'este': colunas[2] , 'cota': colunas[3], aterro: '577fa8ef71a649a105219ef9' }).success(function(data, status){
        console.log(data);
    
    })
    .error(function(data, status){
        console.log("Fail... :-(");
    });;
            
        }
        $scope.content = $fileContent;
    };

     $scope.$on('handleBroadcast', function() {
                    $scope.data = sennitCommunicationService.data;
                    $scope.inputClass = "active";
                    console.log('Mudou aqui');
    }); 
   
}]);
