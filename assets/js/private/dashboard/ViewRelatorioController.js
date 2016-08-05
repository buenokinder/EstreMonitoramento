angular.module('VisualizacaoApp', ['ngSanitize','ng-fusioncharts'])
.controller('ViewTemplateController', ['$scope', '$http', '$element','$compile', function($scope, $http, $element, $compile) {
		$scope.data = ([]);
		$scope.corpo = "";
		$scope.id = location.search;
		$scope.id = $scope.id.replace("?id=","");		
		var grafico = function(id){

			console.log(id);
		}

        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

		$scope.init = function() {			
				$http.get("/Template/"+ $scope.id).then(function (results) {                                
			$scope.data  = results.data;
			$scope.corpo = results.data.corpo; 

                
            var split = $scope.corpo.split('{{');
            function myFunction(item, index) {
            if(index != 0)
                console.log(item.split('}}')[0]);
                $scope.corpo  =    $scope.corpo.replace('{{ '+ item.split('}}')[0] +' }}', '<grafico><grafico>')
            }
split.forEach(myFunction);
//replaceAll($scope.corpo, '{{ grafico() }}', '<grafico><grafico>')


console.log($scope.corpo );
				
				   $scope.corpo  =    $scope.corpo.replace('{{ grafico() }}', '<grafico><grafico>')
			       $element.replaceWith($compile($scope.corpo )($scope));
			});
		};
		$scope.init();
	}]).directive('grafico', [ '$compile', '$http', function ($compile,sennitCommunicationService, $http) {
        return {
            restrict: 'E',
            scope: {
                id: '=',
                type: '=',
                filter: '='
            },
            templateUrl: 'views/reports/grafico.html',
            link: function ($scope, $element, attrs) {
	
            }

        }
    }]);