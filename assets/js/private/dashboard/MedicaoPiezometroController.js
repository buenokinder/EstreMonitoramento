app.controller('MedicaoPiezometroController', ['$scope', '$interval', '$http', 'sennitCommunicationService', function ($scope, $interval, $http, sennitCommunicationService) {
    $scope.data = [];
    $scope.inserted = { data: '', piezometro: ([]) };
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;

    $scope.monitoramentos = {
        dataInicial: '',
        dataFinal: '',
        piezometro: ([]),
        piezometros: ([]),
        piezometrosSearch: ([]),
        monitoramentos: ([]),
        pesquisa: null,
        ordenacao: 'dataInstalacao ASC',

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

            $http.get('/Piezometro').success(function (response, status) {
                var piezometros = [];
                for (var i = 0; i < response.length; i++) {
                    piezometros.push({ id: response[i].id, name: response[i].nome, marker: response[i].nome, icon: '', ticked: false });
                }
                $scope.monitoramentos.piezometros = piezometros;
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

            if (null != $scope.monitoramentos.piezometrosSearch && undefined != $scope.monitoramentos.piezometrosSearch && $scope.monitoramentos.piezometrosSearch.length > 0) {
                var pzs = "";
                angular.forEach($scope.monitoramentos.piezometrosSearch, function (value, key) {
                    pzs += ((pzs == "" ? "" : ",") + value.id);
                });
                query += "&pz=" + pzs;
            }

            $http.get('/piezometro/monitoramentos/' + query).success(function (response, status) {
                $scope.monitoramentos.pesquisa = response;
                console.log("response", response);
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
                            $scope.inserted = { data: '', nomeTopografo: '', nomeAuxiliar: '', temperatura: '', obsGestor: '' };
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

}]);
