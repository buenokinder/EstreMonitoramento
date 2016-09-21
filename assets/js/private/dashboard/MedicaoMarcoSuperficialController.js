app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.verResumos = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;
    $scope.me = window.SAILS_LOCALS;
    $scope.perfil = '';
    //$scope.inserted = { data: getDateTimeString(new Date()), nomeTopografo: '', nomeAuxiliar: '', temperatura: '', obsGestor: '', usuario: $scope.usuario._id, aterro: $scope.usuario._aterro };
    $scope.inserted = { data: getDateTimeString(new Date()), nomeTopografo: 'Admin', nomeAuxiliar: 'Admin', temperatura: '', obsGestor: '', usuario: $scope.usuario._id, aterro: null};

    if ($scope.usuario._aterro != undefined && $scope.usuario._aterro != '') {
        $scope.inserted.aterro = $scope.usuario._aterro;
    }

    $scope.aterros = ([]);

    $scope.monitoramentos.init();

    $scope.changeAterro = function () {
        if ($scope.monitoramentos.aterro) {
            $scope.monitoramentos.marcosSuperficiaisAterro = $filter('filter')($scope.monitoramentos.marcosSuperficiais, { aterro: { id: $scope.monitoramentos.aterro } });
        }
    };

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
            swal("Erro", "Ocorreu uma falha ao importar o marco superficial '" + marcoSuperficial.nome + "' :(", "error");
            callback(null, err, false);
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
    
    $scope.saveMedicaoMarcoSuperficialDetalhes = function (medicaoMarcoSuperficialDetalhes) {

        //medicaoMarcoSuperficialDetalhes.owner = $scope.data;
        medicaoMarcoSuperficialDetalhes.data = getDateTime(medicaoMarcoSuperficialDetalhes.owner.data);

        $scope.getMarcoSuperficial(medicaoMarcoSuperficialDetalhes, function (marcoSuperficial, err, criouMarcoSuperficial) {

            if (err) {
                swal("Erro!", "Ocorreu uma falha ao associar o arquivo à medição :(", "error");
                return;
            }

            if (null != marcoSuperficial && undefined != marcoSuperficial) {

                medicaoMarcoSuperficialDetalhes['marcoSuperficial'] = marcoSuperficial;
                medicaoMarcoSuperficialDetalhes['usuario'] = $scope.usuario._id;

                if (undefined == medicaoMarcoSuperficialDetalhes['aterro']) {
                    if (undefined == $scope.usuario._aterro) {
                        swal("Erro", "Não foi possível associar o aterro à medição :(", "error");
                        return;
                    }

                    medicaoMarcoSuperficialDetalhes['aterro'] = $scope.usuario._aterro;
                }

                if (criouMarcoSuperficial == false) { //O detalhe somente será criado caso o marcoSuperficial não exista
                    $http.post('/MedicaoMarcoSuperficialDetalhes', medicaoMarcoSuperficialDetalhes).success(function (data, status) {
                        $scope.refreshChilds = true;
                        $scope.medicoes.push(medicaoMarcoSuperficialDetalhes);
                    }).error(function (data, status) {
                        swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(", "error");
                    });
                } else {
                    $scope.medicoes.push(medicaoMarcoSuperficialDetalhes);
                    $scope.refreshChilds = true;
                }
            } else {
                swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(", "error");
            }
        });
    };

    function parseMedicao(value) {
        if (undefined == value || null == value || value == '') return 0;

        var ret = parseFloat(value.replace(',', '.').replace('\r', '').trim());

        return ret;
    }
    $scope.showContent = function ($fileContent) {

        var extractMedicaoMarcoSuperficialDetalhes = function (ret, err) {

            if (err) {
                swal("Erro!", "Ocorreu uma falha ao associar o arquivo à medição :(", "error");
                return;
            }

            $scope.medicoes = ([]);
            var linhas = $fileContent.split('\n');

            for (var i = 0; i < linhas.length; i++) {
                var linha = linhas[i];
                var colunas = linha.split(';');

                if (colunas.length < 4) continue;

                var medicao = { 'nome': colunas[0], 'norte': parseMedicao(colunas[1]), 'leste': parseMedicao(colunas[2]), 'cota': parseMedicao(colunas[3]) };
                var medicaoMarcoSuperficialDetalhes = { owner: $scope.data, 'nome': medicao.nome, 'norte': medicao.norte, 'leste': medicao.leste, 'cota': medicao.cota, 'aterro': $scope.data.aterro };

                $scope.saveMedicaoMarcoSuperficialDetalhes(medicaoMarcoSuperficialDetalhes);
            }

            //ENVIAR EMAIL.
            if ($scope.mustSendEmail()) {
                $scope.sendEmail();
            }


            $scope.content = $fileContent;
        };

        var erro = function (err) {
            swal("Erro", "Ocorreu uma falha ao importar o arquivo :(", "error");
        };

        $scope.deleteAllDetalhes({ id: $scope.data.id }, extractMedicaoMarcoSuperficialDetalhes, erro);
    };

    $scope.deleteAllDetalhes = function (data, callback) {
        $http.post('/MedicaoMarcoSuperficialDetalhes/deleteall', data).success(function (response) {
            callback(response);
        }).error(function (err, status) {
            callback(null, err);
        });
    };

    $scope.addMedicao = function () {
        swal({
            title: "",
            text: "Você tem certeza que deseja inserir a medição ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false,
            closeOnCancel: false
        },
                function (isConfirm) {
                    if (isConfirm) {

                        var params = $scope.inserted;

                        params["data"] = getDateTime($scope.inserted.data);
                        params['usuario'] = $scope.usuario._id;

                        if ($scope.usuario._perfil != 'Administrador') {
                            params['aterro'] = $scope.usuario._aterro;
                        } else {
                            params['aterro'] = $scope.inserted.aterro;
                        }

                        $http({
                            method: 'POST',
                            url: '/MedicaoMarcoSuperficial/',
                            data: params
                        }).then(function onSuccess(sailsResponse) {
                            $scope.inputClass = null;
                            $scope.inputClass = "disabled";
                            $scope.refreshChilds = true;
                            $scope.verMedicoes = false;
                            fecharModal("modalView");
                            $scope.inserted = { data: getDateTimeString(new Date()), nomeTopografo: '', nomeAuxiliar: '', temperatura: '', obsGestor: '', usuario: $scope.usuario._id, aterro: $scope.usuario._aterro };
                            swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                            Materialize.toast('Registro inserido com sucesso!', 4000);

                            //ENVIAR EMAIL.
                            if ($scope.mustSendEmail()) {
                                $scope.sendEmail();
                            }
                        })
                        .catch(function onError(sailsResponse) {

                        })
                        .finally(function eitherWay() {
                            $scope.sennitForm.loading = false;
                        });
                    } else {
                        swal("Cancelado", "Seu registro não foi inserido :(", "error");
                    }
                }
        );
    };

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
