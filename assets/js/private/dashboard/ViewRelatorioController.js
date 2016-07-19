angular.module('VisualizacaoApp', ['ngSanitize'])
	.controller('ViewTemplateController', ['$scope', '$http', function($scope, $http) {
		$scope.data = ([]);
		$scope.corpo = "";
		$scope.id = location.search;
		$scope.id = $scope.id.replace("?id=","");		

		$scope.init = function() {			
			$http.get("/Template/"+ $scope.id).then(function (results) {                                
				$scope.data  = results.data;
				$scope.corpo = results.data.corpo;                        
			});
		};
		$scope.init();
	}]);