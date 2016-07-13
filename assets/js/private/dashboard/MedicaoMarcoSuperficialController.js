

app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http',   function($scope, $http){

    $scope.medicoes = [];
      $scope.showContent = function($fileContent){

        var linhas = $fileContent.split('\n');
        for(var i = 0;i < linhas.length;i++){
            var linha = linhas[i];
            var colunas = linha.split(';');


            $http.post('/MedicaoMarcoSuperficial', { 'nome': colunas[0] , 'norte': colunas[1], 'este': colunas[2] , 'cota': colunas[3], aterro: '577d36f57db6c816e1bc5960' }).success(function(data, status){
        console.log(data);
    
    })
    .error(function(data, status){
        console.log("Fail... :-(");
    });;
            
        }
        $scope.content = $fileContent;
    };
   
}]);
