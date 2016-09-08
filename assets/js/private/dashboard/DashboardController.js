
app.filter("asDate", function () {
    return function (input) {
        var d = new Date(input);
        d.setDate(d.getDate() + 1);
        return d;
    }
});

app.controller('DashboardController', ['$scope', '$http', '$location', '$rootScope','$interval', function ($scope, $http, $location, $rootScope, $interval) {
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

        $http.get('Aterro/dashboard')
          .success(function (response) {
              $scope.dashboard.itens = response;
              $scope.refreshMapa();

              $interval($scope.refreshMapa, $scope.DEZ_MINUTOS);
          })
          .error(function (err) {
              console.log("err", err);
          });
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
                exibirfatorseguranca: true,
                preview: true
            }
        },
        itens: ([]),
        currentIndex: 0,
        lastShowedIndex: -1
    };

    $scope.DEZ_MINUTOS = 1000*30;//600000;

    

    $scope.refreshMapa = function () {

        if ($scope.dashboard.lastShowedIndex == $scope.dashboard.currentIndex) {
            return;
        }

        var ticks = (new Date()).getTime()
        var aterro = $scope.dashboard.itens[$scope.dashboard.currentIndex].aterro
        $scope.dashboard.current.aterro = aterro;
        $scope.dashboard.current.mapaHorizontal = 'http://localhost:1337/mapas?id=' + aterro.mapaFile + '&aterro=' + aterro.id + '&data=' + aterro.dataultimamedicao + '&tipo=horizontal' + '&ticks=' + ticks;
        $scope.dashboard.current.mapaVertical = 'http://localhost:1337/mapas?id=' + aterro.mapaFile + '&aterro=' + aterro.id + '&data=' + aterro.dataultimamedicao + '&tipo=vertical' + '&ticks='+ticks;
        $scope.dashboard.current.config = $scope.dashboard.itens[$scope.dashboard.currentIndex].config;

        $scope.dashboard.lastShowedIndex = $scope.dashboard.currentIndex;

        if (($scope.dashboard.currentIndex + 1) < $scope.dashboard.length) {
            $scope.dashboard.currentIndex+= 1;
        }else{
            $scope.dashboard.currentIndex = 0;
        }
    };

    $scope.showConfigFatorSeguranca = function () {

        $('.dropify').dropify({
            messages: {
                default: 'Arraste seu Arquivo'
            }
        });

        $scope.configFatorSeguranca = true;
    };

    $scope.$watch('$routeUpdate', function () {
        $scope.link = $location.path();
        $scope.alteraStatusBreadcrumbs($location.path());
    });

    $scope.perfil = window.SAILS_LOCALS._perfil;
    //$scope.isAdmin =  window.SAILS_LOCALS.me.isAdmin;
    $scope.goto = function (path) {
        $location.path(path);
        $scope.alteraStatusBreadcrumbs(path);
    }

    $scope.showFile = function () {

    };

    $scope.removeFile = function () {

    };

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.removeFile();
    });


    $scope.alteraStatusBreadcrumbs = function (pathname) {
        switch (pathname) {
            case "/OperacaoSecaoCorte":
                $scope.pathname = "Seção de Corte";
                $scope.pai = "Área de Trabalho";
                break;
            case "/PluviometriaVazao":
                $scope.pathname = "Pluviometria e Vazão";
                $scope.pai = "Área de Trabalho";
                break;
            case "/Dashboard":
                $scope.pathname = "Dashboard";
                $scope.pai = undefined;
                break;
            case '/Alerta':
                $scope.pathname = "Alerta";
                $scope.pai = "Dados Mestre";
                break;
            case '/Aterro':
                $scope.pathname = "Aterro";
                $scope.pai = "Dados Mestre";
                break;
            case '/SecaoCorte':
                $scope.pathname = "Seção de Corte";
                $scope.pai = "Dados Mestre";
                break;
            case '/Template':
                $scope.pathname = "Template";
                $scope.pai = "Relatórios";
                break;
            case '/MarcoSuperficial':
                $scope.pathname = "Marco Superficial e Inclinômetro";
                $scope.pai = "Dados Mestre";
                break;
            case '/Piezometro':
                $scope.pathname = "Piezômetro";
                $scope.pai = "Dados Mestre";
                break;
            case '/MedicaoPiezometro':
                $scope.pathname = "Piezômetro";
                $scope.pai = "Área de Trabalho";
                break;
            case '/Usuario':
                $scope.pathname = "Usuário";
                $scope.pai = "Administração";
                break;
            default:
                $scope.pai = undefined;
                $scope.pathname = undefined;
        }
    };

    $scope.init();
}]);
