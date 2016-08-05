angular.module('VisualizacaoApp', ['ngSanitize','ng-fusioncharts'])
.controller('ViewTemplateController', ['$scope', '$http', '$element','$compile', function($scope, $http, $element, $compile) {
		$scope.data = ([]);
		$scope.corpo = "";
		$scope.id = location.search;
		$scope.id = $scope.id.replace("?id=","");		
		var grafico = function(id){

			console.log(id);
		}
		$scope.init = function() {			
			$http.get("/Template/"+ $scope.id).then(function (results) {                                
				$scope.data  = results.data;
				$scope.corpo = results.data.corpo; 
				var respostas = $scope.corpo.split('{{')[1].split('}}');
				console.log('{{'+ respostas[0] +'}}');
				
					$scope.corpo  =    $scope.corpo.replace('{{'+ respostas[0] +'}}', '<grafico><grafico>')
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
				$scope.myDataSource = {
                    chart: {
                        caption: "Teste Estre",
                        subCaption: "Top 5 Teste",
                        numberPrefix: "$",
                        theme: "ocean"
                    },
                    data:[{
                        label: "Marco 1",
                        value: "880000"
                    },
                    {
                        label: "Marco 2",
                        value: "730000"
                    },
                    {
                        label: "Marco 3",
                        value: "590000"
                    },
                    {
                        label: "Marco 5",
                        value: "520000"
                    },
                    {
                        label: "Marco 9",
                        value: "330000"
                    }]
                };




                var chartoptions = {
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: 'Template'
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: [{
                        categories: [$scope.myDataSource.data[0].label, $scope.myDataSource.data[1].label, $scope.myDataSource.data[2].label, $scope.myDataSource.data[3].label, $scope.myDataSource.data[4].label],
                        crosshair: true
                    }],
                    yAxis: [{
                        title: {
                            text: 'Volume',
                            style: {
                                color: '#000'
                            }
                        },
                        labels: {
                            format: 'R$ {value}',
                            style: {
                                color: '#000'
                            }
                        },
                        opposite: true
                    },
                    { //  Secondary yAxis

                        title: {
                            text: '%',
                            style: {
                                color: '#000'
                            }
                        },

                        labels: {
                            format: '{value}%',
                            style: {
                                color: '#000'
                            }
                        }
                    }
                ],
                tooltip: {
                    shared: true
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    //x: 120,
                    //y: 100,
                    x: 0,
                    y: 0,
                    verticalAlign: 'top',
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [

                    {
                        name: 'Volume',
                        type: 'column',
                        color: '#bbb',
                        data: [$scope.myDataSource.data[0].value, $scope.myDataSource.data[1].value, $scope.myDataSource.data[2].value, $scope.myDataSource.data[3].value,$scope.myDataSource.data[4].value],
                        tooltip: {valuePrefix: 'R$ '}
                    },

                    {
                        name: 'Liquidez',
                        type: 'spline',
                        color: '#f00',
                        yAxis: 1,
                        data: [$scope.myDataSource.data[0].value, $scope.myDataSource.data[1].value, $scope.myDataSource.data[2].value, $scope.myDataSource.data[3].value,$scope.myDataSource.data[4].value],
                        tooltip: { valueSuffix: '%' }
                    }
                ]
            };

            $('#grafico').highcharts(chartoptions);                

            }

        }
    }]);