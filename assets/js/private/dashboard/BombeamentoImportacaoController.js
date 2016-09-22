app.controller('BombeamentoImportacaoController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    $scope.bombeamentos = ([]);
    $scope.bombeamentosProcessados = ([]);
    $scope.verMedicoes = false;
    $scope.verResumos = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;
    $scope.me = window.SAILS_LOCALS;
    $scope.perfil = '';
    $scope.aterro = null;
    $scope.aterros = ([]);

    $http.get('/Aterro').success(function (response, status) {
        $scope.aterros = response;
    });

    $scope.insertBombeamento = function (bombeamento) {
        bombeamento.usuario = $scope.usuario._id;
        bombeamento.aterro = $scope.aterro;
        $scope.bombeamentos.push(bombeamento);
    }

    $scope.indexOfBombeamento = function (bombeamento) {
        for (var i = 0; i < $scope.bombeamentos.length; i++) {
            if ($scope.bombeamentos[i].bomba == bombeamento.bomba && getDate($scope.bombeamentos[i].data) == getDate(bombeamento.data)) {
                return i;
            }
        }
        return - 1;
    }

    $scope.saveBombeamentos = function () {
        for (var i = 0; i < $scope.bombeamentos.length; i++) {
            var callback = function (bombeamento, error) {
                if (error) {
                    console.log("erro ao processar o bombeamento:" + bombeamento.nome + ' - ' + bombeamento.data);
                }
            }
            $scope.saveBombeamento(i, callback);
        }
    };

    $scope.extractFileContent = function ($fileContent) {

        $scope.bombeamentos = ([]);
        $scope.bombeamentosProcessados = ([]);
            
        var linhas = $fileContent.split('\n');

        for (var i = 1; i < linhas.length; i++) {
            var colunas = linhas[i].split(';');

            if (colunas.length < 5) continue;
            if (colunas[0] == '') continue;
            if (colunas[1] == '') continue;
            if (!isNumber(colunas[2])) continue;
            if (!isNumber(colunas[3])) continue;
            if (!isNumber(colunas[4])) continue;

            var bombeamento = {
                'data': getDateTime(colunas[0]),
                'bomba': colunas[1],
                'numeros': parseMedicao(colunas[2]),
                'ciclos': parseMedicao(colunas[3]),
                'litros': parseMedicao(colunas[4])
            };

            var index = $scope.indexOfBombeamento(bombeamento);

            if (index < 0) {
                $scope.insertBombeamento(bombeamento);
                index = $scope.bombeamentos.length - 1;
                $scope.bombeamentosProcessados.push(bombeamento);
            }
        }

        $scope.saveBombeamentos();
        $scope.content = $fileContent;

    };

    function parseMedicao(value) {
        if (undefined == value || null == value || value == '' || value== '-') return 0;

        var ret = parseFloat(value.replace(/\./g, '').replace(',', '.').replace('\r', '').trim());

        return ret;
    }

    function isNumber(value) {
        if (undefined == value || null == value || value == '') return false;

        var ret = parseFloat(value.replace(/\./g, '').replace(',', '.').replace('\r', '').trim());

        return !isNaN(ret);
    }

    $scope.saveBombeamento = function (indexMedicao, callback) {

        var params = {};
        for (var p in $scope.bombeamentos[indexMedicao]) {
            params[p] =  $scope.bombeamentos[indexMedicao][p];
        }

        $http({
            method: 'POST',
            url: '/Bombeamento/',
            data: params
        }).then(function onSuccess(sailsResponse) {
            $scope.bombeamentos[indexMedicao].id = sailsResponse.data.id;
            callback($scope.bombeamentos[indexMedicao]);
        })
        .catch(function onError(error) {
            callback($scope.bombeamentos[indexMedicao], error);
        });
    };

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.removeFile();
    });

    $scope.uploadDetalhes = function () {
        $scope.bombeamentos = ([]);
        $scope.content = null;
        $(".dropify").trigger($.Event("dropify.silentClear"), [this]);

        $('.dropify').dropify({
            messages: {
                default: 'Arraste seu Arquivo',
            }
        });
        $('#modalUpload').openModal();
    };

    $scope.addNewMapa = function () {
        $('#modalMedicaoUpload').openModal();
    };

}]);
