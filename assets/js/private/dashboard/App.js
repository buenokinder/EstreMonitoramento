var app = angular.module('DashboardModule', ['xeditable', 'ui.bootstrap',
    	'ngRoute', 'ngMaterial', 'lr.upload',
    	'ngResource', 'leaflet-directive', 'isteven-multi-select', 'ui.utils.masks', 'idf.br-filters', 'textAngular'
]);

Number.prototype.format = function (n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

app.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function (onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function (onLoadEvent) {
                    scope.$apply(function () {
                        fn(scope, { $fileContent: onLoadEvent.target.result });
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
});

app.config(['$httpProvider', function ($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

app.directive('ckEditor', function () {
    return {
        require: '?ngModel',
        link: function (scope, elm, attr, ngModel) {
            CKEDITOR.config.allowedContent = true;
            CKEDITOR.config.height = '600px';

            var ck = CKEDITOR.replace(elm[0]);

            if (!ngModel) return;

            ck.on('instanceReady', function () {
                ck.setData(ngModel.$viewValue);
            });

            function updateModel() {
                scope.$apply(function () {
                    ngModel.$setViewValue(ck.getData());
                });
            }

            ck.on('change', updateModel);
            ck.on('key', updateModel);
            ck.on('dataReady', updateModel);

            ngModel.$render = function (value) {
                ck.setData(ngModel.$viewValue);
            };
        }
    };
});;

app.directive('graficohorizontal', ['$compile', '$http', function ($compile, $http) {
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
            $scope.criterioAceitavelVelocidadeHorizontal = [];
            $scope.criterioAceitavelVelocidadeVertical = [];
            $scope.criterioRegularVelocidadeHorizontal = [];
            $scope.criterioRegularVelocidadeVertical = [];

            var marcoSuperficial = '';
            if ($scope.tipado && $scope.tipado != '') {
                marcoSuperficial = "&marcoSuperficial=" + $scope.tipado
            }
            $http.get("/MarcoSuperficial/monitoramentos/?aterro=" + $scope.aterro + "&order=dataInstalacao%20ASC&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim) + marcoSuperficial).then(function (results) {
                $scope.data = results.data;
                angular.forEach($scope.data, function (value, key) {
                    $scope.deslocamentoHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoHorizontalTotal)]);
                    $scope.deslocamentoHorizontalParcial.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.deslocamentoHorizontalParcial)]);
                    $scope.velocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.velocidadeVertical)]);
                    $scope.criterioAceitavelVelocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.criterioAceitavelVelocidade)]);
                    $scope.criterioRegularVelocidadeHorizontal.push([Date.UTC(value.data.substring(0, 4), parseFloat(value.data.substring(5, 7)) - 1, value.data.substring(8, 10)), parseFloat(value.criterioRegularVelocidade)]);
                });

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
            $scope.criterioAceitavelVelocidadeVertical = [];
            $scope.criterioRegularVelocidadeVertical = [];
            var marcoSuperficial = '';

            if ($scope.tipado && $scope.tipado != '') {
                marcoSuperficial = "&marcoSuperficial=" + $scope.tipado
            }
            $http.get("/MarcoSuperficial/monitoramentos/?aterro=" + $scope.aterro + "&order=dataInstalacao%20ASC&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim) + marcoSuperficial).then(function (results) {
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
                        data: $scope.criterioAceitavelVelocidadeVertical,
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
            tipado: '@',
            inicio: '@',
            fim: '@',
            id: '=',
            tipo: '@',
            filter: '='
        },

        templateUrl: 'views/reports/tabela.html',
        link: function ($scope, $element, attrs) {

            $scope.fatorsegurancaMes = ({});
            $scope.fatorseguranca = ({});
            $scope.fatorsegurancaMeses = ([]);
            $scope.fatorsegurancaSecoes = ([]);
            $scope.aterroNome;
            $scope.marcosuperficialdeslocamento = ({});

            if ($scope.tipo == 'marcosuperficialanomalia') {
                var marcoSuperficial = '';

                if ($scope.tipado && $scope.tipado != '') {
                    marcoSuperficial = "&marcoSuperficial=" + $scope.tipado
                }
                

                $http.get("/marcosuperficial/monitoramentos/?tipo=relatorio&aterro=" + $scope.aterro + "&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim) + marcoSuperficial).then(function (results) {
                    $scope.marcosuperficialanomalia = ([]);
                    $scope.marcosuperficialanomaliaMeses = ([]);
                    $scope.marcosuperficialanomaliaMS = ([]);
                    $scope.marcosuperficialanomaliaRelatorio = ([]);

                    if (results.data.length == 0) {
                        return;
                    }

                    for (var i = 0; i < results.data.length; i++) {
                        $scope.marcosuperficialanomalia.push(results.data[i]);
                    }

                    var loadDistinctMeses = function () {
                        for (var i = 0; i < $scope.marcosuperficialanomalia.length; i++) {
                            if ($scope.marcosuperficialanomaliaMeses.indexOf($scope.marcosuperficialanomalia[i].mes) < 0) {
                                $scope.marcosuperficialanomaliaMeses.push($scope.marcosuperficialanomalia[i].mes);
                            }
                        }
                    };

                    var loadDistinctMS = function () {
                        for (var i = 0; i < $scope.marcosuperficialanomalia.length; i++) {
                            if ($scope.marcosuperficialanomaliaMS.indexOf($scope.marcosuperficialanomalia[i].marcoSuperficial) < 0) {
                                $scope.marcosuperficialanomaliaMS.push($scope.marcosuperficialanomalia[i].marcoSuperficial);
                            }
                        }
                    };

                    loadDistinctMeses();
                    loadDistinctMS();

                    for (var i = 0; i < $scope.marcosuperficialanomaliaMeses.length; i++) {
                        var mes = $scope.marcosuperficialanomaliaMeses[i];
                        var item = { id: i, mes: mes, marcosSuperficiais: [] };

                        for (var j = 0; j < $scope.marcosuperficialanomaliaMS.length; j++) {
                            var adicionouMarco = false;
                            var marcoSuperficial = {nome: $scope.marcosuperficialanomaliaMS[j], criterioAlertaHorizontalMetodologia1: null, criterioAlertaVerticalMetodologia1: null };

                            for (var k = 0; k < $scope.marcosuperficialanomalia.length; k++) {
                                var marco = $scope.marcosuperficialanomalia[k];
                                if (marco.marcoSuperficial == marcoSuperficial.nome && marco.mes == mes) {
                                    adicionouMarco = true;
                                    marcoSuperficial.criterioAlertaHorizontalMetodologia1 = marco.criterioAlertaHorizontalMetodologia1;
                                    marcoSuperficial.criterioAlertaVerticalMetodologia1 = marco.criterioAlertaVerticalMetodologia1;
                                }
                            }
                            if (adicionouMarco) {
                                item.marcosSuperficiais.push(marcoSuperficial);
                            }
                        }

                        $scope.marcosuperficialanomaliaRelatorio.push(item);
                    }

                });
            }

            if ($scope.tipo == 'fatorsegurancames') {

                $http.get("/FatorSeguranca/search/?aterro=" + $scope.aterro + "&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim)).then(function (results) {
                    var result = ([]);
                    var f = [];

                    for (var i = 0; i < results.data.length; i++) {
                        var index = f.indexOf(results.data[i].saturacao);
                        if (index >= 0) {
                            result[index].valorRu += parseFloat(results.data[i].valorRu);
                            result[index].valorLp += parseFloat(results.data[i].valorLp);
                            continue;
                        }

                        result.push({
                            saturacao: results.data[i].saturacao,
                            mes: results.data[i].mes,
                            ano: results.data[i].ano,
                            valorRu: parseFloat(results.data[i].valorRu),
                            valorLp: parseFloat(results.data[i].valorLp),
                            id: results.data[i].id,
                        });

                        f.push(results.data[i].saturacao);
                    }

                    for (var i = 0; i < result.length; i++) {
                        result[i].valorRu = result[i].valorRu.format(2, 3, '.', ',');
                        result[i].valorLp = result[i].valorLp.format(2, 3, '.', ',');
                    }

                    $scope.fatorsegurancaMes = result;

                });
            }

            if ($scope.tipo == 'fatorsegurancasecao') {

                $http.get("/SecaoFatorSeguranca/relatorio/?aterro=" + $scope.aterro + "&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim)).then(function (results) {
                    $scope.fatorseguranca = ([]);
                    $scope.fatorsegurancaMeses = ([]);
                    $scope.fatorsegurancaSaturacao = ([]);
                    $scope.fatorsegurancaSecoes = ([]);
                    $scope.fatorsegurancaRelatorioTrimestral = ([]);

                    if (results.data.length == 0) {
                        return;
                    }

                    for (var i = 0; i < results.data.length; i++) {
                        for (var j = 0; j < results.data[i].length; j++) {
                            $scope.fatorseguranca.push(results.data[i][j]);
                        }
                    }

                    var loadDistinctMeses = function () {
                        for (var i = 0; i < $scope.fatorseguranca.length; i++) {
                            if ($scope.fatorsegurancaMeses.indexOf($scope.fatorseguranca[i].mes) < 0) {
                                $scope.fatorsegurancaMeses.push($scope.fatorseguranca[i].mes);
                            }
                        }
                    };

                    var loadDistinctSecoes = function () {
                        for (var i = 0; i < $scope.fatorseguranca.length; i++) {
                            if ($scope.fatorsegurancaSecoes.indexOf($scope.fatorseguranca[i].secao) < 0) {
                                $scope.fatorsegurancaSecoes.push($scope.fatorseguranca[i].secao);
                            }
                        }
                    };

                    var loadDistinctSaturacoes = function () {
                        for (var i = 0; i < $scope.fatorseguranca.length; i++) {
                            if ($scope.fatorsegurancaSaturacao.indexOf($scope.fatorseguranca[i].saturacao) < 0) {
                                $scope.fatorsegurancaSaturacao.push($scope.fatorseguranca[i].saturacao);
                            }
                        }
                    };

                    loadDistinctMeses();
                    loadDistinctSecoes();
                    loadDistinctSaturacoes();

                    for (var i = 0; i < $scope.fatorsegurancaSecoes.length; i++) {
                        var secao = $scope.fatorsegurancaSecoes[i];
                        var item = { id: i, secao: $scope.fatorsegurancaSecoes[i], saturacao: [] };

                        for (var j = 0; j < $scope.fatorsegurancaSaturacao.length; j++) {
                            var saturacao = { nome: $scope.fatorsegurancaSaturacao[j], meses: [] };
                            var adicionouFatores = false;

                            for (var k = 0; k < $scope.fatorsegurancaMeses.length; k++) {
                                var mes = { nome: $scope.fatorsegurancaMeses[k], fatores: [] };

                                for (var l = 0; l < $scope.fatorseguranca.length; l++) {
                                    var fatorS = $scope.fatorseguranca[l];
                                    if (fatorS.secao == item.secao && fatorS.mes == mes.nome && fatorS.saturacao == saturacao.nome) {
                                        adicionouFatores = true;
                                        mes.fatores.push({ id: fatorS.id, valorRu: fatorS.valorRu, valorLp: fatorS.valorLp })
                                    }
                                }
                                saturacao.meses.push(mes);
                            }

                            if (adicionouFatores) {
                                item.saturacao.push(saturacao);
                            }
                        }

                        $scope.fatorsegurancaRelatorioTrimestral.push(item);
                    }
                });
            }

            if ($scope.tipo == 'fatorseguranca') {//Anual

                $http.get("/SecaoFatorSeguranca/relatorio/?aterro=" + $scope.aterro + "&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim)).then(function (results) {
                    $scope.fatorseguranca = ([]);
                    $scope.fatorsegurancaMeses = ([]);
                    $scope.fatorsegurancaSaturacao = ([]);
                    $scope.fatorsegurancaSecoes = ([]);
                    $scope.fatorsegurancaRelatorioAnual = ([]);

                    if (results.data.length == 0) {
                        return;
                    }

                    for (var i = 0; i < results.data.length; i++) {
                        for (var j = 0; j < results.data[i].length; j++) {
                            $scope.fatorseguranca.push(results.data[i][j]);
                        }
                    }
                    
                    var loadDistinctMeses = function () {
                        for (var i = 0; i < $scope.fatorseguranca.length; i++) {
                            if ($scope.fatorsegurancaMeses.indexOf($scope.fatorseguranca[i].mes) < 0) {
                                $scope.fatorsegurancaMeses.push($scope.fatorseguranca[i].mes);
                            }
                        }
                    };

                    var loadDistinctSecoes = function () {
                        for (var i = 0; i < $scope.fatorseguranca.length; i++) {
                            if ($scope.fatorsegurancaSecoes.indexOf($scope.fatorseguranca[i].secao) < 0) {
                                $scope.fatorsegurancaSecoes.push($scope.fatorseguranca[i].secao);
                            }
                        }
                    };

                    var loadDistinctSaturacoes = function () {
                        for (var i = 0; i < $scope.fatorseguranca.length; i++) {
                            if ($scope.fatorsegurancaSaturacao.indexOf($scope.fatorseguranca[i].saturacao) < 0) {
                                $scope.fatorsegurancaSaturacao.push($scope.fatorseguranca[i].saturacao);
                            }
                        }
                    };

                    loadDistinctMeses();
                    loadDistinctSecoes();
                    loadDistinctSaturacoes();

                    for (var i = 0; i < $scope.fatorsegurancaMeses.length; i++) {
                        var mes = $scope.fatorsegurancaMeses[i];
                        var item = { id: i, mes: mes, secoes: [] };

                        for (var j = 0; j < $scope.fatorsegurancaSecoes.length; j++) {
                            var secao = { nome: $scope.fatorsegurancaSecoes[j], saturacoes: [] };
                            var adicionouFatores = false;

                            for (var k = 0; k < $scope.fatorsegurancaSaturacao.length; k++) {
                                var saturacao = { nome: $scope.fatorsegurancaSaturacao[k], fator:null };

                                for (var l = 0; l < $scope.fatorseguranca.length; l++) {
                                    var fatorS =$scope.fatorseguranca[l];
                                    if (fatorS.secao == secao.nome && fatorS.mes == mes && fatorS.saturacao == saturacao.nome) {
                                        adicionouFatores = true;
                                        saturacao.fator = fatorS.valorLp;
                                    }
                                }

                                if (null != saturacao.fator) {
                                    secao.saturacoes.push(saturacao);
                                }
                            }

                            if (adicionouFatores) {
                                item.secoes.push(secao);
                            }
                        }

                        $scope.fatorsegurancaRelatorioAnual.push(item);
                    }
                });
            }

            if ($scope.tipo == 'acompanhamentomarcosuperficialdeslocamento' || $scope.tipo == 'acompanhamentomarcosuperficial') {
                $http.get("/MarcoSuperficial/monitoramentos/?aterro=" + $scope.aterro + "&order=dataInstalacao%20ASC&dtIni=" + getDateQuery($scope.inicio) + "&dtFim=" + getDateQuery($scope.fim)).then(function (results) {
                    $scope.marcosuperficialdeslocamento = results.data;
                    if ($scope.marcosuperficialdeslocamento.length > 0)
                        $scope.aterroNome = $scope.marcosuperficialdeslocamento[0].aterro.nome;
                });
            }

            $scope.getClass = function (criterio) {
                var name = criterio.toLowerCase();
                var className = name.replace('ã', 'a').replace('á', 'a').replace('ã', 'a').replace('ç', 'c');
                return className;
            }

        }
    }
}]).directive('compile', ['$compile', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
          function (scope) {
              return scope.$eval(attrs.compile);
          },
          function (value) {
              element.html(value);
              $compile(element.contents())(scope);
          }
      );
    };
}]);
