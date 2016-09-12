app.controller('MonitoramentoAterroController', ['$scope', '$http', '$location', '$rootScope', '$interval', function ($scope, $http, $location, $rootScope, $interval) {
    $scope.pai = undefined;
    $scope.pathname = undefined;
    $scope.link = "";
    $scope.loading = false;
    $scope.aterros = ([]);
    $scope.configFatorSeguranca = false;
    $scope.data = {
        fatorseguranca: 0,
        aterro: null,
        exibirmapahorizontal: false,
        exibirmapavertical: false,
        exibirlegendacriterios: false,
    }

    $scope.init = function () {
        $http.get('/aterro').success(function (aterros, status) {
            $scope.aterros = aterros;
        });

        $http.get('/setup').success(function (response, status) {
        });

        $http.get('aterrodashboard/list')
          .success(function (response) {
              $scope.dashboard.itens = response;
              $scope.refresh();

              $interval($scope.refresh, $scope.DEZ_MINUTOS);
          })
          .error(function (err) {
              console.log("err", err);
          });

        $interval(function () {
            $http.get('aterrodashboard/list')
                      .success(function (response) {
                          $scope.dashboard.itens = response;
            });

        }, $scope.DOIS_MINUTOS)
    };

    $scope.dashboard = {
        current: {
            aterro: {},
            mapaHorizontal: '',
            mapaVertical: '',
            config: {
                exibirmapahorizontal: true,
                exibirmapavertical: true,
                exibirlegenda: false,
                fatorseguranca: 0,
                exibirfatorseguranca: true
            }
        },
        itens: ([]),
        currentIndex: 0,
        lastShowedIndex: -1
    };

    $scope.DEZ_MINUTOS = 1000 * 30;//600000;
    $scope.DOIS_MINUTOS = 1000 * 60;//600000;

    $scope.setMapas = function () {
        $(".mapv").each(function (i, o) {
            $(this).prop("src", $scope.dashboard.current.mapaVertical);
        });

        $(".maph").each(function (i, o) {
            $(this).prop("src", $scope.dashboard.current.mapaHorizontal);
        });
    };

    $scope.reset = function () {
        $("#fator").hide();
        $("#legenda").hide();
        $("#mapavertical").hide();
        $("#mapahorizontal").hide();
        $("#doismapas").hide();
        $("#preview").prop("src", "");
        $("#nomeaterro").html("");
    }

    $scope.refresh = function () {

        if ($scope.dashboard.lastShowedIndex == $scope.dashboard.currentIndex) {
            return;
        }

        $scope.reset();
        $scope.setMapas();

        var ticks = (new Date()).getTime()
        var aterro = $scope.dashboard.itens[$scope.dashboard.currentIndex].aterro
        $scope.dashboard.current.aterro = aterro;
        $scope.dashboard.current.mapaHorizontal = '/mapas?id=' + aterro.mapaFile + '&aterro=' + aterro.id + '&data=' + aterro.dataultimamedicao + '&tipo=horizontal' + '&ticks=' + ticks;
        $scope.dashboard.current.mapaVertical = '/mapas?id=' + aterro.mapaFile + '&aterro=' + aterro.id + '&data=' + aterro.dataultimamedicao + '&tipo=vertical' + '&ticks=' + ticks;
        $scope.dashboard.current.config = $scope.dashboard.itens[$scope.dashboard.currentIndex].config;
        $("#nomeaterro").html(aterro.nome);

        if ($scope.dashboard.current.config.exibirfatorseguranca) {
            $("#fator").show();
        }

        if ($scope.dashboard.current.config.exibirlegenda) {
            $("#legenda").show();
        }

        if ($scope.dashboard.current.config.exibirmapavertical && !$scope.dashboard.current.config.exibirmapahorizontal) {
            $("#mapavertical").show();
        }

        if ($scope.dashboard.current.config.exibirmapahorizontal && !$scope.dashboard.current.config.exibirmapavertical) {
            $("#mapahorizontal").show();
        }

        if ($scope.dashboard.current.config.exibirmapahorizontal && $scope.dashboard.current.config.exibirmapavertical) {
            $("#doismapas").show();
        }

        $("#preview").prop("src", $scope.dashboard.current.config.imagemfatorseguranca);

        $scope.dashboard.lastShowedIndex = $scope.dashboard.currentIndex;

        if (($scope.dashboard.currentIndex + 1) < $scope.dashboard.itens.length) {
            $scope.dashboard.currentIndex += 1;
        } else {
            $scope.dashboard.currentIndex = 0;
        }
    };


    $scope.init();
}]);
