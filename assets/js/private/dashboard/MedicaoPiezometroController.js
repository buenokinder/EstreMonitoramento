
app.controller('MedicaoPiezometroController', ['$scope', '$interval', '$http', '$filter', 'sennitCommunicationService', function ($scope, $interval, $http, $filter, sennitCommunicationService) {
    $scope.data = [];
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;
    $scope.inserted = { data: getDateTimeString(new Date()), piezometro: ([]), usuario: $scope.usuario._id, aterro: $scope.usuario._aterro };
    $scope.aterros = ([]);

    $scope.monitoramentos = {
        dataInicial: '',
        dataFinal: '',
        aterro: undefined,
        piezometro: ([]),
        piezometros: ([]),
        piezometrosSearch: ([]),
        piezometrosAterro: ([]),
        monitoramentos: ([]),
        pesquisa: null,
        ordenacao: 'asc',

        init: function () {

            var getDatePtBr = function (date) {
                if (null == date || undefined == date || '' == date)
                    return '';

                var value = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + " 00:00";
                return value;
            };

            $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' });

            var dtIni = (new Date(new Date().setDate(new Date().getDate() - 30)));
            var dtFim = new Date();

            $scope.monitoramentos.dataInicial = getDatePtBr(dtIni);
            $scope.monitoramentos.dataFinal = getDatePtBr(dtFim);

            $http.get('/Aterro').success(function (response, status) {
                $scope.aterros = response;
            });

            $http.get('/Piezometro').success(function (response, status) {
                var piezometros = [];
<<<<<<< HEAD
<<<<<<< HEAD
=======
              //  $("#modalLoading").openModal();
>>>>>>> 069d4f9228c1fcc0035b7ee9466e08dc9f4db46b
=======

                var showLoading = ($("#modalLoading").length > 0);

                if (showLoading) {
                    $("#modalLoading").openModal();
                }
                
>>>>>>> 92a57f5d4e2ebf01d54dee9c8fa706913fefd9f1
                for (var i = 0; i < response.length; i++) {
                    piezometros.push({ id: response[i].id, name: response[i].nome, marker: response[i].nome, icon: '', ticked: false, aterro: response[i].aterro });
                }
                $scope.monitoramentos.piezometros = piezometros;
<<<<<<< HEAD
<<<<<<< HEAD
=======
               // $("#modalLoading").closeModal();
>>>>>>> 069d4f9228c1fcc0035b7ee9466e08dc9f4db46b
=======
                if (showLoading) {
                    $("#modalLoading").closeModal();
                }
>>>>>>> 92a57f5d4e2ebf01d54dee9c8fa706913fefd9f1
            });

            $("#btMonitoramentos").on("click", function (e) {
                e.preventDefault();
                document.location = "#/MonitoramentoPiezometro"
            });
        },

        pesquisar: function () {
            var query = "?order=" + $scope.monitoramentos.ordenacao;

            query += "&dtIni=" + getDateTimeStringQuery($("#dataInicial").val());
            query += "&dtFim=" + getDateTimeStringQuery($("#dataFinal").val());

            if ($scope.monitoramentos.aterro) {
                query += "&aterro=" + $scope.monitoramentos.aterro;
            }

            if (null != $scope.monitoramentos.piezometrosSearch && undefined != $scope.monitoramentos.piezometrosSearch && $scope.monitoramentos.piezometrosSearch.length > 0) {
                var pzs = "";
                angular.forEach($scope.monitoramentos.piezometrosSearch, function (value, key) {
                    pzs += ((pzs == "" ? "" : ",") + value.id);
                });
                query += "&pz=" + pzs;
            }

            $http.get('/piezometro/monitoramentos/' + query).success(function (response, status) {
                $scope.monitoramentos.pesquisa = response;
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
        var showLoading = ($("#modalLoading").length > 0);

        if ($scope.monitoramentos.aterro) {

            if (showLoading) {
                $("#modalLoading").openModal();
            }

            $scope.monitoramentos.piezometrosAterro = $filter('filter')($scope.monitoramentos.piezometros, { aterro: { id: $scope.monitoramentos.aterro } });
            if (showLoading) {
                $("#modalLoading").closeModal();
            }

        }
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
                        $http({
                            method: 'POST',
                            url: '/MedicaoPiezometro/',
                            data: $scope.inserted
                        }).then(function onSuccess(sailsResponse) {
                            $scope.inputClass = null;
                            $scope.inputClass = "disabled";
                            $scope.refreshChilds = true;
                            $scope.verMedicoes = false;
                            $scope.closeMedicao();
                            $scope.inserted = { data: '', nomeTopografo: '', nomeAuxiliar: '', temperatura: '', obsGestor: '', usuario: $scope.usuario._id, aterro: $scope.usuario._aterro };
                            swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                            Materialize.toast('Registro inserido com sucesso!', 4000);
                        })
                        .catch(function onError(sailsResponse) {

                        })
                        .finally(function eitherWay() {
                            $scope.sennitForm.loading = false;
                        })
                    } else {
                        swal("Cancelado", "Seu registro não foi inserido :(", "error");
                    }
                }
        );
    };

    $scope.getClass = function (criterio) {
        var name = criterio.toLowerCase();
        var className = name.replace('ã', 'a').replace('á', 'a').replace('ã', 'a').replace('ç', 'c');
        return className;
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
                            url: '/MedicaoPiezometro/' + $scope.data.id,
                            data: { 'obsOperacional': $scope.data.obsOperacional }
                        }).then(function onSuccess(sailsResponse) {
                            $scope.inputClass = null;
                            $scope.inputClass = "disabled";
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

    $scope.$on('handleBroadcast', function () {
        $scope.data = sennitCommunicationService.data;
        $scope.inputClass = "active";
        $scope.verMedicoes = true;
    });

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.removeFile();
    });


    $scope.uploadDetalhes = function () {
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

    $scope.mustSendEmail = function () {

        return $scope.usuario._perfil == "Gerente";
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

    $scope.sendEmail = function (dataMedicao) {

        $scope.getAterro($scope.usuario._aterro, function (aterro) {
            var emails = getEmailAdministrador(aterro.usuarios);

            if (emails.length > 0) {
                $http({
                    method: 'POST',
                    url: '/email/sendalteracaopiezometro',
                    data: { emails: emails, data: dataMedicao }
                }).then(function onSuccess(sailsResponse) {
                });
            }
        });
    };

    $scope.$on('handleBroadcast', function (e, type) {

        if (sennitCommunicationService.data && sennitCommunicationService.data.data) {
            $scope.data = sennitCommunicationService.data.data;
        }

        if (sennitCommunicationService.type == 'save') {
            if ($scope.mustSendEmail()) {
                $scope.sendEmail($scope.data.dataMedicao);
            }
        }
    });
}]);
