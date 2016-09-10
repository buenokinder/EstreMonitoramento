
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

                console.log($scope.data);
				$scope.corpo = results.data.corpo; 
				var respostas = $scope.corpo.split('{{');

                function myFunction(item, index) {
                    if(index != 0){
                        var tipo = item.split('}}')[0];
                        if(tipo.indexOf('tabela(') !== -1){
                            var parametro = tipo.split('\'')[1];
                          
                   
				     	    $scope.corpo  =    $scope.corpo.replaceAll('{{'+ item.split('}}')[0] +'}}', '<tabela tipo=\''+parametro+'\'></tabela>  ');
                        }
                        if(tipo.indexOf('grafico(') !== -1){
                            var parametro = tipo.split('\'')[1]; 
                              console.log(parametro);


                            var parametro2 = tipo.split('\'')[3];
                            $scope.corpo  =    $scope.corpo.replaceAll('{{'+ item.split('}}')[0] +'}}', '<grafico tipo=\''+parametro+'\' tipado=\''+parametro2+'\'  inicio=\''+$scope.data.dataInicial+'\' fim=\''+$scope.data.dataFim+'\'  ></grafico>  ');
                          console.log(  $scope.corpo );
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
                tipo: '@',
                tipado: '@',
                inicio: '@',
                fim: '@'
            },
            
            templateUrl: 'views/reports/grafico.html',
            link: function ($scope, $element, attrs) {
                $scope.data = ([]);
       
                $scope.deslocamentoVertical = [];// = [[ Date.UTC(1970, 9, 21),0.0000],[ Date.UTC(1970, 9, 23),1.0000]];
$scope.array = "";
                console.log($scope.tipado);
                console.log($scope.dataInicio);

                console.log($scope.deslocamentoVertical);
                if($scope.tipo == 'marcovertical'){
		            $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42&marcoSuperficial=" + $scope.tipado ).then(function (results) {                                
				        $scope.data  = results.data;
                
              
                      angular.forEach($scope.data, function(value, key) {
                      
                     
                        $scope.deslocamentoVertical.push( [ Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7))-1, value.data.substring(8, 10)),parseFloat(value.deslocamentoHorizontalTotal)]);
                     
                                
                        
                        //if(key==0)
                            //$scope.deslocamentoVertical= [ [Date.UTC(1970, 9, 21), 0],   [Date.UTC(1970, 10, 4), 0.28]] ;
//                        if(key!=0){
//                        if (key==1){
//                          $scope.deslocamentoVertical += "["; 
//                        }
//                        console.log($scope.data.length);
//                        console.log(key);
//                          if (($scope.data.length) != (key+1)){
//                              $scope.deslocamentoVertical += "[ Date.UTC(1970, 9, 21)," + c + "],";
//                          }else{
//                              $scope.deslocamentoVertical += "[ Date.UTC(1970, 9, 23)," + value.deslocamentoVerticalTotal + "]" + "]";
//                          }
//                          }
//  console.log($scope.deslocamentoVertical);  
                    
                            
                      });
                      $scope.categorias = [ $scope.array ];
                         $('#container').highcharts({
        title: {
            text: $scope.tipado + ' - Vertical',
            x: -20 //center
        },
        
       xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                month: '%e. %b',
                year: '%b'
            },
            title: {
                text: 'Date'
            }
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
            data: $scope.deslocamentoVertical
            
        }]
    });  
                    });
                     
                    
                };

              

       
        }
    }}]).directive('tabela', [ '$compile', '$http', function ($compile, $http) {
        return {
            restrict: 'AE',
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
