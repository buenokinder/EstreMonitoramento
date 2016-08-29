app.controller('OperacaoSecaoCorteController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    $scope.operacaoSecaoCortes = [];
    $scope.usuario = window.SAILS_LOCALS;
    $scope.secaoCortes = ([]);
    $scope.querydape = [];
    $scope.hasFullPermission = $scope.usuario._perfil != 'Gerente'; //O gerente só pode visualizar e criar

    $scope.pesquisar = function () {
        var query = "";
        for (var key in $scope.querydapesquisa) {
            query += key + "=" + $scope.querydapesquisa[key] + "&";
        }

        query += "&datainicial=" + getDateQuery($("#datainicial").val()) + "&datafinal=" + getDateQuery($("#datafinal").val());

        $http.get('/OperacaoSecaoCorte/Search?' + query).success(function (data) {
            $scope.operacaoSecaoCortes = angular.fromJson(data);
            $scope.configOperacaoSecaoCortes();
        });
    };

    $scope.init = function () {

        $http.get('/Usuario').success(function (data) {
            $scope.usuarios = angular.fromJson(data);
        });
        $http.get('/Aterro').success(function (data) {
            $scope.aterros = data;
        });

        $http.get('/SecaoCorte').success(function (data) {
            $scope.secaoCortes = data;
        });

        $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY', time: false });

        $http.get('/OperacaoSecaoCorte').success(function (data) {
            $scope.operacaoSecaoCortes = angular.fromJson(data);
            $scope.configOperacaoSecaoCortes();
        });
    };

    $scope.configOperacaoSecaoCortes = function () {
        angular.forEach($scope.operacaoSecaoCortes, function (value, key) {
            if (value["secaoCorte"])
                value["secaoCorte"] = value["secaoCorte"].id;
            if (value["usuario"])
                value["usuario"] = value["usuario"].id;
            if (value["aterro"])
                value["aterro"] = value["aterro"].id;
            value["dataMedicao"] = getDate(value["dataMedicao"]);
        });
    };

    $scope.loadSecaoCorte = function () {
        return $scope.secaoCortes.length ? null : $http.get('/SecaoCorte').success(function (data) {
            $scope.secaoCortes = data;
        });
    };

    $scope.formatDates = function (el) {
        $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY', time: false });
    };

    $scope.showDate = function (value) {
        if (null == value || undefined == value) return;
        return getDate(value);
    };

    $scope.showSecaoCorte = function (data) {
        if (data.secaoCorte && $scope.secaoCortes.length) {
            var selected = $filter('filter')($scope.secaoCortes, { id: data.secaoCorte });
            return selected.length ? selected[0].nome : 'Não selecionado';
        } else {
            return data.nome || 'Não selecionado';
        }
    };

    $scope.showAterro = function (data) {
        var selected = [];
        if (data.aterro) {
            selected = $filter('filter')($scope.aterros, { id: data.aterro });
        }
        return selected.length ? selected[0].nome : 'Não selecionado';
    };

    $scope.showUsuario = function (data) {
        var selected = [];
        if (data.usuario) {
            selected = $filter('filter')($scope.usuarios, { id: data.usuario });
        }
        return selected.length ? selected[0].name : 'Não selecionado';
    };

    $scope.saveSecaoCorte = function (data, id, index) {
        var value = $('table tr:eq(' + (index + 1) + ') .datetimepicker').val();

        if (undefined == data.secaoCorte) {
            swal("Dados Inválidos!", "Selecione a seção de corte.", "error");
            return;
        }

        if ('' == value) {
            swal("Dados Inválidos!", "Informe uma data de medição.", "error");
            return;
        }

        data.dataMedicao = getDateTime(value);
        data.usuario = $scope.usuario._id;

        $scope.operacaoSecaoCortes[index].dataMedicao = data.dataMedicao;


        var configModal = {
            title: "",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false,
            closeOnCancel: false
        };

        if (id) {
            configModal.text = "Você tem certeza que deseja inserir a operação ?";

            swal(configModal,
                function (isConfirm) {
                    if (isConfirm) {
                        return $http({
                            method: 'PUT',
                            url: '/OperacaoSecaoCorte/' + id,
                            data: data
                        }).then(function onSuccess(sailsResponse) {
                            $scope.operacaoSecaoCortes[index].dataMedicao = data.dataMedicao;
                            swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                            Materialize.toast('Registro alterado com sucesso!', 4000);
                            return true;
                        });
                    } else {
                        swal("Cancelado", "Seu registro está seguro :)", "error");
                    }
                }
            );
        }
        else {

            configModal.text = "Você tem certeza que deseja inserir a operação ?";
            swal(configModal,
                function (isConfirm) {
                    if (isConfirm) {
                        angular.extend(data, { usuario: $scope.usuario._id }, { aterro: $scope.usuario._aterro });
                        return $http({
                            method: 'POST',
                            url: '/OperacaoSecaoCorte/',
                            data: data
                        }).then(function onSuccess(sailsResponse) {
                            data.id = sailsResponse.data.id;
                            $scope.operacaoSecaoCortes[index].id = data.id;
                            $scope.operacaoSecaoCortes[index].dataMedicao = data.dataMedicao;


                            swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                            Materialize.toast('Registro inserido com sucesso!', 4000);
                            return true;
                        });
                    } else {
                        swal("Cancelado", "Seu registro não foi salvo :)", "error");
                    }
                }
            );
        }
    };

    $scope.cancel = function (index, rowform) {
        if ($scope.operacaoSecaoCortes[index].id == undefined) {
            $scope.operacaoSecaoCortes.splice(index, 1);
            return;
        }
        rowform.$cancel();
    };

    $scope.removeSecaoCorte = function (id, index) {
        swal({
            title: "Você tem certeza que deseja excluir?",
            text: "Não será mais possivel recuperar esse Registro!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false,
            closeOnCancel: false
        },
            function (isConfirm) {
                if (isConfirm) {
                    swal("Deletado!", "Seu registro foi excluido.", "success");
                    $http.delete('/OperacaoSecaoCorte/' + id)
                    .then(function (project) {
                        $scope.operacaoSecaoCortes.splice(index, 1);
                    });
                } else {
                    swal("Cancelado", "Seu registro está seguro :)", "error");
                }
            }
        );
    };

    $scope.addSecaoCorte = function () {
        $scope.inserted = {
            dataMedicao: null,
            aterro: $scope.usuario._aterro,
            usuario: $scope.usuario._id,
            createdAt: new Date(),
            tipoEstaca: null,
            altura: null,
            comprimento: null
        };
        $scope.operacaoSecaoCortes.push($scope.inserted);
    };

}]);
