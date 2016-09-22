app.controller('SecaoCorteImportacaoController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    $scope.secoesCorte = ([]);
    $scope.secoesCorteProcessadas = ([]);
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

    $scope.saveOperacaoSecaoCorte = function (secaoCorte, operacaoSecaoCorte) {

        operacaoSecaoCorte.secaoCorte = secaoCorte.id;

        $http.post('/OperacaoSecaoCorte', operacaoSecaoCorte).success(function (data, status) {
        }).error(function (data, status) {
            console.log("Erro", "Ocorreu uma falha ao importar a operação do dia '" + operacaoSecaoCorte.dataMedicao + "' :(");
        });
    };

    $scope.insertSecaoCorte = function (secaoCorte) {
        secaoCorte.habilitado = true;
        secaoCorte.usuario = $scope.usuario._id;
        secaoCorte.aterro = $scope.aterro;
        secaoCorte.operacoes = ([]);
        $scope.secoesCorte.push(secaoCorte);
    }

    $scope.indexOfSecaoCorte = function (secaoCorte) {

        for (var i = 0; i < $scope.secoesCorte.length; i++) {
            if ($scope.secoesCorte[i].nome == secaoCorte.nome) {
                return i;
            }
        }
        return - 1;
    }

    $scope.saveSecoesCorte = function () {
        for (var i = 0; i < $scope.secoesCorte.length; i++) {
            var callback = function (secaoCorte, error) {
                if (error) {
                    console.log("erro ao processar a seção de corte:" + secaoCorte);
                }

                for (var j = 0; j < secaoCorte.operacoes.length; j++) {
                    $scope.saveOperacaoSecaoCorte(secaoCorte, secaoCorte.operacoes[j]);
                }
            }
            $scope.saveSecaoCorte(i, callback);
        }
    };

    $scope.extractFileContent = function ($fileContent) {

        $scope.secoesCorte = ([]);
        $scope.secoesCorteProcessadas = ([]);
            
        var linhas = $fileContent.split('\n');

        for (var i = 1; i < linhas.length; i++) {
            var colunas = linhas[i].split(';');

            if (colunas.length < 5) continue;
            if (colunas[0] == '') continue;
            if (colunas[1] == '') continue;
            if (colunas[2] == '') continue;

            if (!isNumber(colunas[3])) continue;
            if (!isNumber(colunas[4])) continue;

            var secaoCorte = {
                'nome': colunas[0]
            };

            var index = $scope.indexOfSecaoCorte(secaoCorte);

            if (index < 0) {
                $scope.insertSecaoCorte(secaoCorte);
                index = $scope.secoesCorte.length-1;
            }

            var operacaoSecaoCorte = {
                'dataMedicao': getDateTime(colunas[1]),
                'tipoEstaca': colunas[2],
                'altura': parseMedicao(colunas[3]),
                'comprimento': parseMedicao(colunas[4]),
                'aterro': $scope.aterro,
                'usuario': $scope.usuario._id
            };

            $scope.secoesCorte[index].operacoes.push(operacaoSecaoCorte);
            $scope.secoesCorteProcessadas.push({ nome: secaoCorte.nome, dataMedicao: getDate(operacaoSecaoCorte.dataMedicao) });
        }

        $scope.saveSecoesCorte();
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

    $scope.saveSecaoCorte = function (indexMedicao, callback) {

        var params = {};
        for (var p in $scope.secoesCorte[indexMedicao]) {
            params[p] =  $scope.secoesCorte[indexMedicao][p];
        }
        delete params['operacoes'];

        $http({
            method: 'POST',
            url: '/SecaoCorte/',
            data: params
        }).then(function onSuccess(sailsResponse) {
            $scope.secoesCorte[indexMedicao].id = sailsResponse.data.id;
            callback($scope.secoesCorte[indexMedicao]);
        })
        .catch(function onError(error) {
            callback($scope.secoesCorte[indexMedicao], error);
        });
    };

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.removeFile();
    });

    $scope.uploadDetalhes = function () {
        $scope.secoesCorte = ([]);
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
