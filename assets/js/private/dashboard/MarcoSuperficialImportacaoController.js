app.controller('MarcoSuperficialImportacaoController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    $scope.medicoes = ([]);
    $scope.medicoesProcessadas = ([]);
    $scope.verMedicoes = false;
    $scope.verResumos = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;
    $scope.me = window.SAILS_LOCALS;
    $scope.perfil = '';

    //$scope.inserted = { data: getDateTimeString(new Date()), nomeTopografo: 'Admin', nomeAuxiliar: 'Admin', temperatura: '', obsGestor: '', usuario: $scope.usuario._id, aterro: $scope.usuario._aterro };
    $scope.inserted = { data: null, nomeTopografo: 'Admin', nomeAuxiliar: 'Admin', temperatura: '10', obsGestor: '', usuario: $scope.usuario._id, aterro: null };
    $scope.aterros = ([]);

    $http.get('/Aterro').success(function (response, status) {
        $scope.aterros = response;
    });

    $scope.removeFile = function () {
        $scope.deleteAllDetalhes({ id: $scope.data.id }, function () {
            $scope.medicoes = ([]);
            $scope.refreshChilds = true;
            $scope.content = null;
            swal("Arquivo Removido!", "Arquivo removido com sucesso.", "success");
        }, function () {
            swal("Erro", "Ocorreu uma falha ao remover o arquivo :(", "error");
        });
    };

    $scope.createMarcoSuperficial = function (marcoSuperficial, callback) {
        $http.post('/MarcoSuperficial', marcoSuperficial).success(function (response, status) {
            callback(response, null, true);
        }).error(function (err, status) {
            $http.get('/MarcoSuperficial/?nome='+marcoSuperficial.nome).success(function (response, status) {
                callback(response[0], null, false);
            }).error(function (err, status) {
               console.log("Erro", "Ocorreu uma falha ao importar o marco superficial '" + marcoSuperficial.nome + "' :(");
               callback(null, err, false);
            });
        });
    };

    $scope.getMarcoSuperficial = function (medicaoMarcoSuperficialDetalhes, callback) {
        $http.get('/MarcoSuperficial/searchbyname/?nome=' + medicaoMarcoSuperficialDetalhes.nome + '&aterro=' + medicaoMarcoSuperficialDetalhes.aterro.id).success(function (response, status) {

            if (null == response || response.length == 0) {
                var marcosuperficial = {};
                marcosuperficial.nome = medicaoMarcoSuperficialDetalhes.nome;
                marcosuperficial.leste = medicaoMarcoSuperficialDetalhes.leste;
                marcosuperficial.norte = medicaoMarcoSuperficialDetalhes.norte;
                marcosuperficial.cota = medicaoMarcoSuperficialDetalhes.cota;
                marcosuperficial.habilitado = true;
                marcosuperficial.dataInstalacao = medicaoMarcoSuperficialDetalhes.data;
                marcosuperficial.aterro = medicaoMarcoSuperficialDetalhes.aterro;
                marcosuperficial.usuario = $scope.usuario._id;

                $scope.createMarcoSuperficial(marcosuperficial, callback);
            } else {
                callback(response[0], null, false);
            }

        }).error(function (err, status) {
            callback(null, err);
        });
    };
    
    $scope.saveMedicaoMarcoSuperficialDetalhes = function (medicao, medicaoMarcoSuperficialDetalhes) {

        medicaoMarcoSuperficialDetalhes.data = getDateTime(medicao.data);
        medicaoMarcoSuperficialDetalhes.owner = medicao.id;

        $scope.getMarcoSuperficial(medicaoMarcoSuperficialDetalhes, function (marcoSuperficial, err, criouMarcoSuperficial) {

            if (err) {
                console.log("Erro!", "Ocorreu uma falha ao associar o arquivo à medição :(");
                return;
            }

            if (null != marcoSuperficial && undefined != marcoSuperficial) {

                medicaoMarcoSuperficialDetalhes['marcoSuperficial'] = marcoSuperficial;
                medicaoMarcoSuperficialDetalhes['usuario'] = $scope.usuario._id;

                if (undefined == medicaoMarcoSuperficialDetalhes['aterro']) {
                    if (undefined == $scope.usuario._aterro) {
                        console.log("Erro", "Não foi possível associar o aterro à medição :(");
                        return;
                    }
                    medicaoMarcoSuperficialDetalhes['aterro'] = $scope.usuario._aterro;
                }

                if (criouMarcoSuperficial == false) { //O detalhe somente será criado caso o marcoSuperficial exista
                    $http.post('/MedicaoMarcoSuperficialDetalhes', medicaoMarcoSuperficialDetalhes).success(function (data, status) {
                    }).error(function (data, status) {
                        console.log("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(");
                    });
                }
                //else {
                //    $scope.medicoes.push(medicaoMarcoSuperficialDetalhes);
                //   // $scope.refreshChilds = true;
                //}
            } else {
                console.log("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(");
            }
        });
    };

    $scope.insertMedicao = function (medicao) {
        medicao.nomeTopografo= 'Admin';
        medicao.nomeAuxiliar = 'Admin';
        medicao.temperatura = 0;
        medicao.usuario = $scope.usuario._id;
        medicao.aterro = $scope.inserted.aterro;
        medicao.detalhes = ([]);
        $scope.medicoes.push(medicao);
    }

    $scope.indexOfMedicao = function (medicao) {

        for (var i = 0; i < $scope.medicoes.length; i++) {
            if (getDate($scope.medicoes[i].data) == getDate(medicao.data)) {
                return i;
            }
        }
        return - 1;
    }

    $scope.saveMedicoes = function () {
        for (var i = 0; i < $scope.medicoes.length; i++) {
            var callback = function (medicao, error) {
                if (error) {
                    console.log("erro ao processar a medicao:" + medicao.data);
                }

                for (var j = 0; j < medicao.detalhes.length; j++) {
                    $scope.saveMedicaoMarcoSuperficialDetalhes(medicao, medicao.detalhes[j]);
                }
            }
            $scope.saveMedicao(i, callback);
        }
    };

    $scope.extractFileContent = function ($fileContent) {

        $scope.medicoes = ([]);
        $scope.medicoesProcessadas = ([]);
            
        var linhas = $fileContent.split('\n');

        for (var i = 1; i < linhas.length; i++) {
            var colunas = linhas[i].split(';');

            if (colunas.length < 5) continue;
            if (colunas[0] == '') continue;
            if (colunas[1] == '') continue;
            if (!isNumber(colunas[2])) continue;
            if (!isNumber(colunas[3])) continue;
            if (!isNumber(colunas[4])) continue;

            var medicao = { 'data': getDateTime(colunas[1])};

            var index = $scope.indexOfMedicao(medicao);

            if (index < 0) {
                $scope.insertMedicao(medicao);
                index = $scope.medicoes.length-1;
            }

            var aterro = $("#aterro").val().replace("string:", "");

            if ($scope.inserted.aterro) {
                aterro = $scope.inserted.aterro;
                if ($scope.inserted.aterro.id) {
                    aterro = $scope.inserted.aterro.id;
                }
            } 
            var medicaoMarcoSuperficialDetalhes = { 'nome': colunas[0], 'norte': parseMedicao(colunas[2]), 'leste': parseMedicao(colunas[3]), 'cota': parseMedicao(colunas[4]), 'aterro': aterro};
            $scope.medicoes[index].detalhes.push(medicaoMarcoSuperficialDetalhes);
            $scope.medicoesProcessadas.push(medicaoMarcoSuperficialDetalhes);

            //$scope.saveMedicaoMarcoSuperficialDetalhes(medicaoMarcoSuperficialDetalhes);
        }

        $scope.saveMedicoes();
        $scope.content = $fileContent;

    };

    function parseMedicao(value) {
        if (undefined == value || null == value || value == '') return 0;

        var ret = parseFloat(value.replace(/\./g, '').replace(',', '.').replace('\r', '').trim());

        return ret;
    }

    function isNumber(value) {
        if (undefined == value || null == value || value == '') return false;

        var ret = parseFloat(value.replace(/\./g, '').replace(',', '.').replace('\r', '').trim());

        return !isNaN(ret);
    }

    $scope.deleteAllDetalhes = function (data, callback) {
        $http.post('/MedicaoMarcoSuperficialDetalhes/deleteall', data).success(function (response) {
            callback(response);
        }).error(function (err, status) {
            callback(null, err);
        });
    };

    $scope.saveMedicao = function (indexMedicao, callback) {

        var params = {};
        for (var p in $scope.medicoes[indexMedicao]) {
            params[p] =  $scope.medicoes[indexMedicao][p];
        }
        delete params['detalhes'];

        $http({
            method: 'POST',
            url: '/MedicaoMarcoSuperficial/',
            data: params
        }).then(function onSuccess(sailsResponse) {
            $scope.medicoes[indexMedicao].id = sailsResponse.data.id;
            callback($scope.medicoes[indexMedicao]);
        })
        .catch(function onError(error) {
            callback($scope.medicoes[indexMedicao], error);
        });
    };

    $scope.getCssClass = function (alerta) {
        if (null == alerta || undefined == alerta || '' == alerta.trim()) return;
        return (alerta.replace("ç", "c").replace("ã", "a").replace("á", "a")).toLowerCase();
    }

    $scope.getAterro = function (id, callback) {
        $http.get('/Aterro/' + id).success(function (data) {
            callback(data);
        });
    };

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.removeFile();
    });

    $scope.uploadDetalhes = function () {
        $scope.medicoes = ([]);
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
