
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
    $scope.init = function () {
        $http.get("/Template/" + $scope.id).then(function (results) {
            $scope.data = results.data;


            $scope.corpo = results.data.corpo;
            var respostas = $scope.corpo.split('{{');

            function myFunction(item, index) {
                if (index != 0) {
                    var tipo = item.split('}}')[0];
                    if (tipo.indexOf('tabela(') !== -1) {
                        var parametro = tipo.split('\'')[1];


                        $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipo=\'' + parametro + '\'></tabela>  ');
                    }
                    if (tipo.indexOf('grafico(') !== -1) {
                        var parametro = tipo.split('\'')[1];


                        var parametro2 = tipo.split('\'')[3];
                        console.log(parametro);
                        if (parametro == 'marcohorizontal') {
                            $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficohorizontal>  ');
                        } else {
                            $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficovertical>  ');
                        }

                        console.log($scope.corpo);
                    }
                }
            }
            respostas.forEach(myFunction);
            $element.replaceWith($compile($scope.corpo)($scope));

        });
    };
    $scope.init();
}]).directive('graficohorizontal', ['$compile', '$http', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
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


            $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42&marcoSuperficial=" + $scope.tipado).then(function (results) {
                $scope.data = results.data;


                angular.forEach($scope.data, function (value, key) {


                    $scope.deslocamentoHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoHorizontalTotal)]);
                    $scope.deslocamentoHorizontalParcial.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoHorizontalParcial)]);
                    $scope.velocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.velocidadeVertical)]);





                });
                $scope.categorias = [$scope.array];
                $('#' + $scope.getContentHorizontal()).highcharts({
                    title: {
                        text: $scope.tipado + ' - Horizontal',
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
                        name: 'DESLOCAMENTO HORIZONTAL TOTAL',
                        data: $scope.deslocamentoHorizontal

                    }, {
                            name: 'DESLOCAMENTO HORIZONTAL PARCIAL',
                            data: $scope.deslocamentoHorizontalParcial

                        }, {
                            name: 'VELOCIDADE HORIZONTAL',
                            data: $scope.velocidadeHorizontal

                        }]
                });
            });



        }
    }
}]).directive('graficovertical', ['$compile', '$http', function ($compile, $http) {
    return {
        restrict: 'E',
        scope: {
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


            $http.get("/MarcoSuperficial/monitoramentos/?order=dataInstalacao%20ASC&dtIni=2016-08-10%2018:42&dtFim=2016-09-30%2018:42&marcoSuperficial=" + $scope.tipado).then(function (results) {
                $scope.data = results.data;


                angular.forEach($scope.data, function (value, key) {

                    $scope.deslocamentoVertical.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoVerticalTotal)]);
                    $scope.deslocamentoVerticalParcial.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoVerticalParcial)]);
                    $scope.velocidadeVertical.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.velocidadeVertical)]);

                });
                $scope.categorias = [$scope.array];
                var html = "<div style='width: 70%; '><div id='" + $scope.tipado + "' style='min-width: 310px;max-width: 550px ; height: 400px; margin: 0 auto'></div></div>";
                $element.replaceWith($compile(html)($scope));

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

                    }, {
                            name: 'DESLOCAMENTO VERTICAL PARCIAL',
                            data: $scope.deslocamentoVerticalParcial

                        }, {
                            name: 'VELOCIDADE VERTICAL',
                            data: $scope.velocidadeVertical

                        }]
                });
            });



        }
    }
}]).directive('tabela', ['$compile', '$http', function ($compile, $http) {
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

            $scope.init = function () {


                if ($scope.tipo == 'fatorsegurancames') {
                    $http.get("/FatorSeguranca/").then(function (results) {
                        $scope.fatorsegurancaMes = results.data;
                    });
                }
            }
        }
    }
}]);
