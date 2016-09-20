app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', '$filter', 'sennitCommunicationService', function ($scope, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    var deferred = $.Deferred();

    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.verResumos = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;
    $scope.me = window.SAILS_LOCALS;
    $scope.perfil = '';
    $scope.inserted = { data: getDateTimeString(new Date()), nomeTopografo: '', nomeAuxiliar: '', temperatura: '', obsGestor: '', usuario: $scope.usuario._id, aterro: $scope.usuario._aterro };
    $scope.aterros = ([]);
    $scope.monitoramentos = {
        dataInicial: '',
        dataFinal: '',
        aterro: undefined,
        marcosSuperficiais: ([]),
        marcosSuperficiaisAterro: ([]),
        marcosSuperficiaisSearch: ([]),
        monitoramentos: ([]),
        pesquisa: null,
        ordenacao: 'dataInstalacao ASC',

        init: function () {

            $scope.perfil = $scope.me._perfil;

            $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
                $scope.inserted.data = getDateTimeString(date);
            });
            var dtIni = (new Date(new Date().setDate(new Date().getDate() - 30)));
            var dtFim = new Date();

            $scope.monitoramentos.dataInicial = getDateTimeString(dtIni);
            $scope.monitoramentos.dataFinal = getDateTimeString(dtFim);
            $http.get('/Aterro').success(function (response, status) {
                $scope.aterros = response;
            });

            $http.get('/MarcoSuperficial').success(function (response, status) {
                var marcosSuperficiais = [];
                for (var i = 0; i < response.length; i++) {
                    marcosSuperficiais.push({ id: response[i].id, name: response[i].nome, marker: response[i].nome, icon: '', ticked: false, aterro: response[i].aterro });
                }
                $scope.monitoramentos.marcosSuperficiais = marcosSuperficiais;
            });

            $("#btMonitoramentos").on("click", function (e) {
                e.preventDefault();
                document.location = "#/MonitoramentoMarcoSuperficial"
            });
        },

        pesquisarResumo: function (owner, marcosSuperficiais, aterro, data, callback) {
            var query = "?order=" + $scope.monitoramentos.ordenacao;

            query += "&data=" + getDateQuery(data);
            query += "&owner=" + owner;
            query += "&ms=" + marcosSuperficiais;
            query += "&aterro=" + ((typeof aterro === "object") ? aterro.id : aterro);

            $http.get('/MarcoSuperficial/monitoramentos/' + query).success(function (response, status) {
                $scope.monitoramentos.resumo = response;

                callback();
            });
        },

        pesquisar: function () {
            var query = "?order=" + $scope.monitoramentos.ordenacao;
            query += "&dtIni=" + getDateTimeStringQuery($("#dataInicial").val());
            query += "&dtFim=" + getDateTimeStringQuery($("#dataFinal").val());

            //console.log("$scope.monitoramentos.aterro", $scope.monitoramentos.aterro);
            if ($scope.monitoramentos.aterro  && typeof $scope.monitoramentos.aterro != "object") {
                query += "&aterro=" + $scope.monitoramentos.aterro;
            }

            if (null != $scope.monitoramentos.marcosSuperficiaisSearch && undefined != $scope.monitoramentos.marcosSuperficiaisSearch && $scope.monitoramentos.marcosSuperficiaisSearch.length > 0) {
                var ms = "";
                angular.forEach($scope.monitoramentos.marcosSuperficiaisSearch, function (value, key) {
                    ms += ((ms == "" ? "" : ",") + value.id);
                });
                query += "&ms=" + ms;
            }

            $http.get('/MarcoSuperficial/monitoramentos/' + query).success(function (response, status) {

                var ret = [];
                for (var i = 0; i < response.length; i++) {
                    var item = response[i];
                    if (item.medicaoMarcoSuperficial == undefined) {
                        item.deslocamentoHorizontalParcial = undefined;
                        item.deslocamentoHorizontalTotal = undefined;
                        item.velocidadeHorizontal = undefined;
                        item.velocidadeVertical = undefined;
                        item.deslocamentoVerticalParcial = undefined;
                        item.deslocamentoVerticalTotal = undefined;
                        item.sentidoDeslocamentoDirerencaNorte = undefined;
                        item.sentidoDeslocamentoDirerencaEste = undefined;
                        item.sentidoDeslocamentoNorteSul = undefined;
                        item.sentidoDeslocamentoLesteOeste = undefined;
                        item.sentido = undefined;
                        item.vetorDeslocamentoSeno = undefined;
                        item.vetorDeslocamentoAngulo = undefined;
                    }

                    ret.push(item);
                }

        
                $scope.monitoramentos.pesquisa = ret;
                setInterval(function () {
                    var $fixedColumn = $('#fixed');
                    var $pesquisa = $('#pesquisa');
                    $fixedColumn.find('tbody tr').each(function (i, elem) {
                        $(this).height($pesquisa.find('tbody  tr:eq(' + i + ')').height());
                    });
                }, 0);
            });
        }
    };

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

    $scope.getCssClass = function (alerta) {
        if (null == alerta || undefined == alerta || '' == alerta.trim()) return;

        return (alerta.replace("ç", "c").replace("ã", "a").replace("á", "a")).toLowerCase();
    }

    $scope.saveObsOperacional = function () {
        swal({
            title: "",
            text: "Você tem certeza que deseja inserir a observação ?",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false,
            closeOnCancel: false
        },
                function (isConfirm) {
                    if (isConfirm) {
                        $http({
                            method: 'PUT',
                            url: '/MedicaoMarcoSuperficial/' + $scope.data.id,
                            data: { 'obsOperacional': $scope.data.obsOperacional }
                        }).then(function onSuccess(sailsResponse) {
                            $scope.inputClass = null;
                            $scope.inputClass = "disabled";
                            fecharModal("modalUpload");
                            swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                            Materialize.toast('Registro alterado com sucesso!', 4000);
                        })
                        .catch(function onError(sailsResponse) {

                        })
                        .finally(function eitherWay() {
                            $scope.sennitForm.loading = false;
                        })
                    } else {
                        swal("Cancelado", "Seu registro não foi alterado :(", "error");
                    }
                }
        );
    };

    $scope.mustSendEmail = function () {
        return $scope.me._perfil == "Gerente";
    };

    $scope.getAterro = function (id, callback) {
        $http.get('/Aterro/' + id).success(function (data) {
            callback(data);
        });
    };

    getEmailAdministrador = function (usuarios) {
        var emails = [];

        for (var i = 0; i < usuarios.length; i++) {
            var usuario = usuarios[i];
            if (usuario.perfil == "Administrador") {
                emails.push(usuario.email);
            }
        }
        return emails;
    }

    $scope.sendEmail = function () {

        $scope.getAterro($scope.me._aterro, function (aterro) {
            var emails = getEmailAdministrador(aterro.usuarios);

            if (emails.length > 0) {
                $http({
                    method: 'POST',
                    url: '/email/sendmarcosuperficial',
                    data: { emails: emails, data: $scope.data.data }
                }).then(function onSuccess(sailsResponse) {
                });
            }
        });
    },

    $scope.$on('handleBroadcast', function (e, type) {

        if (sennitCommunicationService.data) {
            $scope.data = sennitCommunicationService.data;
        }

        switch (sennitCommunicationService.type) {
            case 'select':
                $scope.medicoes = ([]);
                $scope.inputClass = "active";
                $scope.verResumos = false;
                $scope.verMedicoes = true;
                break;

            case 'delete':
                var data = $scope.data;

                $scope.deleteAllDetalhes({ id: data.id }, function () {
                }, function () {
                    swal("Erro", "Ocorreu uma falha ao remover os detalhes da medição :(", "error");
                });
                break;

            case 'save':
                //ENVIAR EMAIL.
                if ($scope.mustSendEmail()) {
                    $scope.sendEmail();
                }
                break;

            default:
                $scope.verMedicoes = false;
                $scope.monitoramentos.resumo = ([]);

                var data = $scope.data;

                var pesquisarResumo = function (medicaoId, itens) {
                    var ms = "";
                    var mss = [];

                    angular.forEach(itens, function (value, key) {
                        var marcoSuperficialId = typeof value.marcoSuperficial === "object" ? value.marcoSuperficial.id : value.marcoSuperficial;

                        if (mss.indexOf(marcoSuperficialId) < 0) {
                            ms += ((ms == "" ? "" : ",") + marcoSuperficialId);
                            mss.push(marcoSuperficialId);
                        }
                    });

                    $scope.monitoramentos.pesquisarResumo(medicaoId, ms, data.aterro, data.data, function () {
                        $scope.verResumos = true;
                    });
                };

                if (undefined != data.medicaoMarcoSuperficialDetalhes && data.medicaoMarcoSuperficialDetalhes.length > 0) {
                    pesquisarResumo(data.id, data.medicaoMarcoSuperficialDetalhes);
                }
                else {
                    $http.get('/MedicaoMarcoSuperficialDetalhes/?owner=' + data.id).success(function (itens, status) {
                        pesquisarResumo(data.id, itens);
                    }).error(function (data, status) {
                        swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(", "error");
                    });
                }
                break;
        }
    });


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
