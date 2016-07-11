

app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http',   function($scope, $http){
      $scope.showContent = function($fileContent){

        var linhas = $fileContent.split('\n');
        for(var i = 0;i < linhas.length;i++){
            var linha = linhas[i];

            console.log(lines[i])
        }
        $scope.content = $fileContent;
    };
   
}]);
