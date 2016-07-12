

app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http',   function($scope, $http){

    $scope.medicoes = [];
      $scope.showContent = function($fileContent){

        var linhas = $fileContent.split('\n');
        for(var i = 0;i < linhas.length;i++){
            var linha = linhas[i];
            var colunas = linha.split(';');


            $http.post('/MedicaoMarcoSuperficial', { 'marco': colunas[0] , 'norte': colunas[1], 'este': colunas[2] , 'cota': colunas[3] });
            
        }
        $scope.content = $fileContent;
    };
   
}]);
