angular.module('VisualizacaoApp', ['ngSanitize' ]).controller('ViewTemplateController', ['$scope', '$http', '$element','$compile', function($scope, $http, $element, $compile) {
		
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

        $scope.data = ([]);
		$scope.corpo = "";
		$scope.id = getParameterByName('id');
        $scope.aterro = getParameterByName('aterro');
		
        String.prototype.replaceAll = function(s,r){return this.split(s).join(r)}
		$scope.init = function() {			
			$http.get("/Template/"+ $scope.id).then(function (results) {                                
				$scope.data  = results.data;
				$scope.corpo = results.data.corpo; 
				var respostas = $scope.corpo.split('{{');

                function myFunction(item, index) {
                    if(index != 0){
                        var tipo = item.split('}}')[0];
                        if(tipo.indexOf('tabela(') !== -1){
                            var parametro = tipo.split('\'')[1];
                            console.log(parametro);
                   
				     	    $scope.corpo  =    $scope.corpo.replaceAll('{{'+ item.split('}}')[0] +'}}', '<tabela tipo=\''+parametro+'\'></tabela>  ');
                        }
                        if(tipo.indexOf('grafico(') !== -1){
                            var parametro = tipo.split('\'')[1];
                            console.log(parametro);
                            $scope.corpo  =    $scope.corpo.replaceAll('{{'+ item.split('}}')[0] +'}}', '<grafico tipo=\''+parametro+'\'></grafico>  ');
                        }
                    }
                }
                respostas.forEach(myFunction);
                $element.replaceWith($compile($scope.corpo )($scope));
             
			});
		};
		$scope.init();
	}]).directive('grafico', [ '$compile', '$http', function ($compile, $http) {
        return {
            restrict: 'E',
            scope: {
                id: '=',
                tipo: '@',
                filter: '='
            },
            templateUrl: 'views/reports/grafico.html',
            link: function ($scope, $element, attrs) {
 $('#container').highcharts({
        title: {
            text: 'MSD 01 - Vertical',
            x: -20 //center
        },
        
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Deslocamentos (cm)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
       
        series: [{
            name: 'DESLOCAMENTO VERTICAL TOTAL',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'DESLOCAMENTO VERTICAL PARCIAL',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: 'CRITERIO DE ALERTA 2',
            data: [1.25, 1.25, 1.25, 1.25, 1.25, 1.25, 1.25, 1.25, 1.25, 1.25, 1.25, 1.25]
        }, {
            name: 'CRITERIO DE ALERTA 3',
            data: [3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25, 3.25]
        },  {
            name: 'VELOCIDADE VERTICAL',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });   
        }
    }}]).directive('tabela', [ '$compile', '$http', function ($compile, $http) {
        return {
            restrict: 'E',
            scope: {
                id: '=',
                tipo: '@',
                filter: '='
            },
            templateUrl: 'views/reports/tabela.html',
            link: function ($scope, $element, attrs) {
            $scope.fatorsegurancaMes = ({});

             
 if($scope.tipo == 'fatorsegurancames'){
                    $http.get("/FatorSeguranca/").then(function (results) {   
                        $scope.fatorsegurancaMes = results.data;
                    });
                }

                 if($scope.tipo == 'fatorseguranca'){
                    $http.get("/FatorSeguranca/").then(function (results) {   
                        $scope.fatorsegurancaMes = results.data;
                    });
                }
              
            $scope.init = function(){
                console.log('foi');
                if($scope.tipo == 'fatorsegurancames'){
                    $http.get("/FatorSeguranca/").then(function (results) {   
                        $scope.fatorsegurancaMes = results.data;
                    });
                }
            }
        }
    }}]);