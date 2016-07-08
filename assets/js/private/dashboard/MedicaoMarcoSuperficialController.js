

app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http',   function($scope, $http){
      $scope.showContent = function($fileContent){
        $scope.content = $fileContent;
    };
   
}]);
