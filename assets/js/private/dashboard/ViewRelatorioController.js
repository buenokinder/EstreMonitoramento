
angular.module('VisualizacaoApp', ['ngSanitize']).controller('ViewTemplateController', ['$scope', '$http', '$element', '$compile', function ($scope, $http, $element, $compile) {

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

    String.prototype.replaceAll = function (s, r) { return this.split(s).join(r) }

  
    $scope.download= "";


    $scope.init = function () {
        $http.get("/Template/" + $scope.id).then(function (results) {
            $scope.data = results.data;

            $scope.corpo += "<header class='onlyprint'><img src='/images/logo_pdf.png' class='logo'  ></header>";
            $scope.corpo += results.data.corpo;
            var respostas = $scope.corpo.split('{{');

            function myFunction(item, index) {
                if (index != 0) {
                    var tipo = item.split('}}')[0];
                    if (tipo.indexOf('tabela(') !== -1) {
                        var parametro = tipo.split('&#39;')[1];


                        $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipo=\'' + parametro + '\' aterro=\'' + $scope.aterro  + '\'   inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\' ></tabela>  ');
                    }
                    if (tipo.indexOf('grafico(') !== -1) {
                        var parametro = tipo.split('&#39;')[1];


                        var parametro2 = tipo.split('&#39;')[3];
                        console.log(parametro);
                        if (parametro == 'marcohorizontal') {
                            $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro  + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficohorizontal>  ');
                        } else {
                            $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro  + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficovertical>  ');
                        }

                    }
                }
            }


            respostas.forEach(myFunction);
        
   
           $element.replaceWith($compile($scope.corpo)($scope));

            

        });
    };

}]).directive('graficohorizontal', ['$compile', '$http', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            aterro: '@',
            tipado: '@',
            inicio: '@',
            fim: '@'
        },
        templateUrl: 'views/reports/grafico.html',
 
        link: function ($scope, $element, attrs) {
            $scope.data = ([]);
            $scope.velocidadeHorizontal = [];
            $scope.deslocamentoHorizontalParcial = [];


            $scope.getContentHorizontal = function () {
                return $scope.tipado + "horizontal";
            }
            $scope.deslocamentoHorizontal = [];

            $scope.array = "";
            $scope.criterioAceitavelVelocidadeHorizontal =  [];
            $scope.criterioAceitavelVelocidadeVertical =  [];
            $scope.criterioRegularVelocidadeHorizontal =  [];
            $scope.criterioRegularVelocidadeVertical =  [];


            $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42&marcoSuperficial=" + $scope.tipado).then(function (results) {
                $scope.data = results.data;


                angular.forEach($scope.data, function (value, key) {


                $scope.deslocamentoHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoHorizontalTotal)]);
                $scope.deslocamentoHorizontalParcial.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoHorizontalParcial)]);
                $scope.velocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.velocidadeVertical)]);



                $scope.criterioAceitavelVelocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.criterioAceitavelVelocidade)]);

                $scope.criterioRegularVelocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.criterioRegularVelocidade)]);
               
 
 


                });

                 console.log($scope.criterioRegularVelocidadeHorizontal);

                $scope.categorias = [$scope.array];
                $('#' + $scope.getContentHorizontal()).highcharts({
                    title: {
                        text: $scope.tipado + ' - Horizontal',
                        x: -20 //center
                    },

                     yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Deslocamentos (cm)',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Velocidade (cm/dia)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
                  

                    series: [{
                        name: 'DESLOCAMENTO HORIZONTAL TOTAL',
                        data: $scope.deslocamentoHorizontal

                    }, {
                            name: 'DESLOCAMENTO HORIZONTAL PARCIAL',
                            data: $scope.deslocamentoHorizontalParcial

                        }, {
                            name: 'VELOCIDADE HORIZONTAL',
                            data: $scope.velocidadeHorizontal,
                            yAxis: 1

                        }, {
                            name: 'CRITÉRIO DE ALERTA 2',
                            color: 'red',
        dashStyle: 'ShortDash',
                            data: $scope.criterioAceitavelVelocidadeHorizontal,
                            yAxis: 1

                        }, {
                            name: 'CRITÉRIO DE ALERTA 3',
                            color: 'red',
        dashStyle: 'ShortDash',
                            data: $scope.criterioRegularVelocidadeHorizontal,
                            yAxis: 1

                        }]
                });
            });



        }
    }
}]).directive('graficovertical', ['$compile', '$http', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
            aterro: '@',
            tipado: '@',
            inicio: '@',
            fim: '@'
        },

          templateUrl: 'views/reports/grafico.html',
        link: function ($scope, $element, attrs) {
            $scope.data = ([]);


            $scope.getContentHorizontal = function () {
                return $scope.tipado + "vertical";
            }

            $scope.velocidadeVertical = [];
            $scope.deslocamentoVerticalParcial = [];
            $scope.deslocamentoVertical = [];
            $scope.array = "";
             $scope.criterioAceitavelVelocidadeVertical= [];
$scope.criterioRegularVelocidadeVertical= [];

            $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42&marcoSuperficial=" + $scope.tipado).then(function (results) {
                $scope.data = results.data;


                angular.forEach($scope.data, function (value, key) {

                    $scope.deslocamentoVertical.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoVerticalTotal)]);
                    $scope.deslocamentoVerticalParcial.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoVerticalParcial)]);
                    $scope.velocidadeVertical.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.velocidadeVertical)]);
                    
                    
                $scope.criterioRegularVelocidadeVertical.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.criterioAceitavelVelocidade)]);

                $scope.criterioAceitavelVelocidadeVertical.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.criterioRegularVelocidade)]);
               
 
                });
                $scope.categorias = [$scope.array];
               

                $('#' + $scope.getContentHorizontal()).highcharts({
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
                    yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Deslocamentos (cm)',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Velocidade (cm/dia)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
                    tooltip: {
                        valueSuffix: '°C'
                    },

                    series: [{
                        name: 'DESLOCAMENTO VERTICAL TOTAL',
                        data: $scope.deslocamentoVertical

                    }, {
                            name: 'DESLOCAMENTO VERTICAL PARCIAL',
                            data: $scope.deslocamentoVerticalParcial

                        }, {
                            name: 'VELOCIDADE VERTICAL',
                            data: $scope.velocidadeVertical

                        }, {
                            name: 'CRITÉRIO DE ALERTA 2',
                            data: $scope.criterioRegularVelocidadeVertical,
                            color: 'red',
                            dashStyle: 'ShortDash',
                            yAxis: 1

                        }, {
                            name: 'CRITÉRIO DE ALERTA 3',
                            data:  $scope.criterioAceitavelVelocidadeVertical,
                            color: 'red',
                            dashStyle: 'ShortDash',
                            yAxis: 1
                        }]
                });
            });



        }
    }
}]).directive('tabela', ['$compile', '$http', function ($compile, $http) {
    return {
        restrict: 'AE',
        scope: {
            aterro: '@',
            id: '=',
            tipo: '@',
            filter: '='
        },
        
        templateUrl: 'views/reports/tabela.html',
      

        link: function ($scope, $element, attrs) {
            console.log($scope.tipo);



            //$element.html(template);
          //  $compile($element.contents())($scope);


            //$element.replaceWith($scope.tipo);
            $scope.fatorsegurancaMes = ({});
              $scope.aterroNome;
            $scope.marcosuperficialdeslocamento  = ({});

            if ($scope.tipo == 'fatorsegurancames') {
                $http.get("/FatorSeguranca/").then(function (results) {
                    $scope.fatorsegurancaMes = results.data;
                });
            }

            if ($scope.tipo == 'fatorseguranca') {
                $http.get("/FatorSeguranca/").then(function (results) {
                    $scope.fatorsegurancaMes = results.data;
                });
            }

            if ($scope.tipo == 'acompanhamentomarcosuperficialdeslocamento' || $scope.tipo == 'acompanhamentomarcosuperficial') {
                $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42").then(function (results) {
                    $scope.marcosuperficialdeslocamento = results.data;
                    if( $scope.marcosuperficialdeslocamento.length > 0)
                        $scope.aterroNome =    $scope.marcosuperficialdeslocamento[0].aterro.nome;
                });
            }

            //  if ($scope.tipo == 'acompanhamentomarcosuperficial') {
            //     $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42").then(function (results) {
            //         $scope.marcosuperficialdeslocamento = results.data;
            //         if( $scope.marcosuperficialdeslocamento.length > 0)
            //             $scope.aterroNome =    $scope.marcosuperficialdeslocamento[0].aterro.nome;
            //     });
            // }


            $scope.init = function () {
                if ($scope.tipo == 'fatorsegurancames') {
                    $http.get("/FatorSeguranca/").then(function (results) {
                        $scope.fatorsegurancaMes = results.data;
                    });
                }
            }

            $scope.getClass = function (criterio) {
                var name = criterio.toLowerCase();
                var className = name.replace('ã', 'a').replace('á', 'a').replace('ã', 'a').replace('ç', 'c');
                return className;
            }
        }
    }
}]).directive('ckEditor',['$compile', '$http', function ($compile, $http) {
    return {
    require: '?ngModel',
    link: function(scope, elm, attr, ngModel) {
        CKEDITOR.config.allowedContent = true;
      var ck = CKEDITOR.replace(elm[0]);

      if (!ngModel) return;

      ck.on('instanceReady', function() {
          console.log($compile(ngModel.$viewValue)(scope));
        ck.setData($compile(ngModel.$viewValue)(scope));
      });

      function updateModel() {
          scope.$apply(function() {
              ngModel.$setViewValue(ck.getData());
          });
      }

      ck.on('change', updateModel);
      ck.on('key', updateModel);
      ck.on('dataReady', updateModel);

      ngModel.$render = function(value) {
        ck.setData($compile(ngModel.$viewValue)(scope));
      };
    }
  };
}]);;
