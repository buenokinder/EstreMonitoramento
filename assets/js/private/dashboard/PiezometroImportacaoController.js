app.controller('PiezometroImportacaoController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    $scope.piezometros = ([]);
    $scope.piezometrosProcessados = ([]);
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

    $scope.savePiezometroMedicoes = function (piezometro, medicaoPiezometro) {

        medicaoPiezometro.owner = piezometro.id;

        $http.post('/MedicaoPiezometro', medicaoPiezometro).success(function (data, status) {
        }).error(function (data, status) {
            console.log("Erro", "Ocorreu uma falha ao importar a medicao do dia '" + medicaoPiezometro.data + "' :(");
        });
    };

    $scope.insertPiezometro = function (piezometro) {
        piezometro.habilitado = true;
        piezometro.usuario = $scope.usuario._id;
        piezometro.aterro = $scope.aterro;
        piezometro.nivelAceitavel = 999999999999999;
        piezometro.nivelRegular = 999999999999999;
        piezometro.nivelAtencao = 999999999999999;
        piezometro.nivelIntervencao = 999999999999999;
        piezometro.nivelParalisacao = 999999999999999;
        piezometro.medicoes = ([]);
        $scope.piezometros.push(piezometro);
    }

    $scope.indexOfPiezometro = function (piezometro) {

        for (var i = 0; i < $scope.piezometros.length; i++) {
            if ($scope.piezometros[i].nome == piezometro.nome) {
                return i;
            }
        }
        return - 1;
    }

    $scope.savePiezometros = function () {
        for (var i = 0; i < $scope.piezometros.length; i++) {
            var callback = function (piezometro, error) {
                if (error) {
                    console.log("erro ao processar o piezôemtro:" + piezometro.nome + ' - ' + piezometro.dataMedicao);
                }

                for (var j = 0; j < piezometro.medicoes.length; j++) {
                    $scope.savePiezometroMedicoes(piezometro, piezometro.medicoes[j]);
                }
            }
            $scope.savePiezometro(i, callback);
        }
    };

    $scope.extractFileContent = function ($fileContent) {

        $scope.piezometros = ([]);
        $scope.piezometrosProcessados = ([]);
            
        var linhas = $fileContent.split('\n');

        for (var i = 1; i < linhas.length; i++) {
            var colunas = linhas[i].split(';');

            if (colunas.length < 9) continue;
            if (colunas[0] == '') continue;
            if (colunas[1] == '') continue;
            if (!isNumber(colunas[2])) continue;
            if (!isNumber(colunas[3])) continue;
            if (!isNumber(colunas[4])) continue;
            if (!isNumber(colunas[5])) continue;

            var piezometro = {
                'nome': colunas[0],
                'dataMedicao': getDateTime(colunas[1]),
                'salienciaInicial': parseMedicao(colunas[2]),
                'celulaPiezometrica': parseMedicao(colunas[3]),
                'profundidadeTotalInicial': parseMedicao(colunas[4]),
                'profundidadeMediaCamaraCargaInicial': parseMedicao(colunas[5])
            };

            var index = $scope.indexOfPiezometro(piezometro);

            if (index < 0) {
                $scope.insertPiezometro(piezometro);
                index = $scope.piezometros.length-1;
            }

            var medicaoPiezometro = {
                'dataMedicao': getDateTime(colunas[1]),
                'temperatura': 0,
                'saliencia': parseMedicao(colunas[2]),
                'prolongamentoCorte': (colunas[6] == "-" ? 0 : parseMedicao(colunas[6])),
                'medicoesNivelChorumeComPressaoNivelMedido': parseMedicao(colunas[7]),
                'medicoesNivelChorumeSemPressaoNivelMedido': parseMedicao(colunas[8]),
                'pressaoGasKpa': parseMedicao(colunas[9]),
                'pressaoGasMca': parseMedicao(colunas[9]) / 9.8066,
                'aterro': $scope.aterro,
                'usuario': $scope.usuario._id
            };

            $scope.piezometros[index].medicoes.push(medicaoPiezometro);
            $scope.piezometrosProcessados.push({piezometro: piezometro.nome, dataMedicao:getDate(piezometro.dataMedicao)});
        }

        $scope.savePiezometros();
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

    $scope.savePiezometro = function (indexMedicao, callback) {

        var params = {};
        for (var p in $scope.piezometros[indexMedicao]) {
            params[p] =  $scope.piezometros[indexMedicao][p];
        }
        delete params['medicoes'];

        $http({
            method: 'POST',
            url: '/Piezometro/',
            data: params
        }).then(function onSuccess(sailsResponse) {
            $scope.piezometros[indexMedicao].id = sailsResponse.data.id;
            callback($scope.piezometros[indexMedicao]);
        })
        .catch(function onError(error) {
            callback($scope.piezometros[indexMedicao], error);
        });
    };

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.removeFile();
    });

    $scope.uploadDetalhes = function () {
        $scope.piezometros = ([]);
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
