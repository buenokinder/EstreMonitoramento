app.controller('PluviometriaVazaoController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    $scope.operacaoPluviometrias = [];
    $scope.mes = { id: 1 };
    $scope.meses = [{ id: 1, name: 'Janeiro' }, { id: 2, name: 'Fevereiro' }, { id: 3, name: 'Março' }, { id: 4, name: 'Abril' }, { id: 5, name: 'Maio' }, { id: 6, name: 'Junho' }, { id: 7, name: 'Julho' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Setembro' }, { id: 10, name: 'Outubro' }, { id: 11, name: 'Novembro' }, { id: 12, name: 'Dezembro' }];
    $scope.ano = { id: 2016 };
    $scope.anos = ([]);
    $scope.anosToAssociateWithFile = ([]);
    $scope.anoAssociatedWithFile = undefined;
    $scope.mesAssociatedWithFile = undefined;
    $scope.aterrosAssociatedWithFile = ([]);
    $scope.aterroAssociatedWithFile = undefined;
    $scope.aterros = ([]);
    $scope.usuarios = [];
    $scope.currentAno = (new Date()).getFullYear();
    $scope.totalSent = 0;
    $scope.totalErrors = 0;
    $scope.aterro = null;
    $scope.excel = ([]);
    $scope.usuario = null;
    $scope.me = window.SAILS_LOCALS;
    $scope.aterroid;
    $scope.hasFullPermission = $scope.me._perfil != 'Gerente'; //O gerente só pode visualizar e criar

    $scope.search = function () {
        var url = '/PluviometriaVazao/search?mes=' + $scope.mes.id + '&ano=' + $scope.ano.id;

        if ($scope.aterroid) {
            url += '&aterro=' + $scope.aterroid;
        }

        $http.get(url).success(function (data) {
            $scope.operacaoPluviometrias = angular.fromJson(data);
        });
    };

    $scope.loadDistinctAnos = function (callback) {
        $http.get('/PluviometriaVazao/listDistinctAnos').success(function (data) {
            if (data.length == 0) {
                $scope.anos = [{ id: $scope.currentAno }];

                if (undefined != callback) {
                    callback();
                }
                return;
            }

            $scope.anos = angular.fromJson(data);
            if (undefined != callback) {
                callback();
            }
        });
    };

    $scope.init = function () {

        $scope.loadDistinctAnos();
        $scope.loadAterros();
        $scope.loadUsuarios();
        $scope.ano = { id: $scope.currentAno };
        for (var i = 2016; i <= $scope.currentAno; i++) {
            $scope.anosToAssociateWithFile.push({ id: i });
        }
    }

    $scope.loadAterros = function () {
        return $scope.aterros.length ? null : $http.get('/Aterro/Search').success(function (data) {
            $scope.aterros = angular.fromJson(data);
            $scope.aterrosAssociatedWithFile = angular.fromJson(data);

            for (var i = 0; i < $scope.aterros.length; i++) {
                if ($scope.aterros[i].id == $scope.me._aterro) {
                    $scope.aterro = $scope.aterros[i];
                }
            }
            
        });
    };
    
    $scope.loadUsuarios = function () {
        return $scope.usuarios.length ? null : $http.get('/Usuario/Search').success(function (data) {
            $scope.usuarios = data;

            for (var i = 0; i < $scope.usuarios.length; i++) {
                if ($scope.usuarios[i].id == $scope.me._id) {
                    $scope.usuario = $scope.usuarios[i];
                    console.log("$scope.usuario", $scope.usuario);
                    break;
                }
            }
        });
    };

    $scope.uploadPluviometria = function () {
        $('.dropify').dropify({
            messages: {
                default: 'Arraste seu Arquivo',
            }
        });
        $('#modalPluviometria').openModal();
    };

    function checkStatusImport() {
        if ($scope.totalSent == $scope.excel.length - 1) {
            Materialize.toast('Importação finalizada ' + ($scope.totalErrors > 0 ? 'com erros.' : '') + '!', 4000);
            
            if($scope.totalErrors == 0)
                fecharModal("modalPluviometria");

            $scope.loadDistinctAnos(function () {
                $scope.ano = $scope.anoAssociatedWithFile;
                $scope.mes = $scope.mesAssociatedWithFile;
                $scope.search();
            });

            $scope.totalSent = 0;
            $scope.totalErrors = 0;
        }
    }

    $scope.getMedicao = function (medicao, callback) {
        $http.get('/PluviometriaVazao/search?dia=' + medicao.dia + '&mes=' + medicao.mes + '&ano=' + medicao.ano + '&aterro=' + medicao.aterro).success(function (data) {
            callback(data.length > 0 ? angular.fromJson(data[0]) : null);
        });
    };

    $scope.removeMedicao = function (medicao, callback, calbackError) {
        $http.delete('/PluviometriaVazao/' + medicao.id, medicao).then(function (result) {
            callback(angular.fromJson(result.data));
        }, function (error) {
            calbackError(error);
        });
    };

    $scope.addMedicao = function (medicao) {

        medicao.usuario = $scope.usuario.id;

        $http.post('/PluviometriaVazao', medicao).then(
          function (result) {
              $scope.totalSent += 1;
              checkStatusImport();
              
          }, function (error) {
              swal("Erro", "Ocorreu uma falha ao importar a medição do dia '" + medicao.data + "'. Verifique se já foi inserida uma medição para essa mesma data anteriormente. :(", "error");
              $scope.totalSent += 1;
              $scope.totalErrors += 1;
              checkStatusImport();
          });
    };

    $scope.validateUpload = function () {

        if (undefined == $scope.mesAssociatedWithFile) {
            swal("Erro", "Selecione o mês associado ao arquivo selecionado. :(", "error");
            return false;
        }

        if (undefined == $scope.anoAssociatedWithFile) {
            swal("Erro", "Selecione o ano associado ao arquivo selecionado. :(", "error");
            return false;
        }

        if (undefined == $scope.aterroAssociatedWithFile) {
            swal("Erro", "Selecione o aterro associado ao arquivo selecionado. :(", "error");
            return false;
        }

        return true;
    }

    $scope.loadFile = function () {
        if (!$scope.validateUpload()) {
            return;
        }

        alasql('SELECT * FROM FILE(?,{headers:false})', [event], function (res) {
            $scope.excel = angular.fromJson(res);
            $("#excel-data").show();
            $scope.addMedicoes($scope.excel);
        });
        
    };

    $scope.addMedicoes = function (medicoes) {
        
        angular.forEach(medicoes, function (registro, index) {
            if (index != 0) {
                var medicao = { data: registro.A + '/' + $scope.mesAssociatedWithFile.id + '/' + $scope.anoAssociatedWithFile.id, dia: registro.A, pluviometria: registro.B, vazao: registro.C, aterro: $scope.aterroAssociatedWithFile, usuario: $scope.me._id, mes: $scope.mesAssociatedWithFile.id, ano: $scope.anoAssociatedWithFile.id };

                $scope.getMedicao(medicao, function (result) {
                    if (null == result) {
                        $scope.addMedicao(medicao);
                    } else {

                        if (!$scope.hasFullPermission) {//Não tem permissão full, não pode editar um registro.
                            swal("Erro", "Não será possível incluir o registro referente a '" + medicao.data + "', pois já existe outra medição para esse mesmo dia. :(", "error");
                        } else {
                            $scope.removeMedicao(result, function () {
                                $scope.addMedicao(medicao);
                            }, function () {
                                swal("Erro", "Ocorreu uma falha ao atualizar a medição do dia '" + medicao.dia + "/" + medicao.mes + "/" + medicao.ano + "'. :(", "error");
                            });
                        }
                    }
                });
            }
        });
    };

    //$scope.showAterro = function (data) {
    //    var selected = [];
    //    if (data.aterro) {
    //        selected = $filter('filter')($scope.aterros, { id: data.aterro });
    //    }
    //    return selected.length ? selected[0].nome : 'Não selecionado';
    //};

    $scope.showAterro = function (data) {
        var selected = [];
        if (data.aterro == null) {
            return '';
        }

        if (data.aterro.id) {
            selected = $filter('filter')($scope.aterros, { id: data.aterro.id });
            return selected.length ? selected[0].nome : 'Não selecionado';
        }

        if (data.aterro) {
            selected = $filter('filter')($scope.aterros, { id: data.aterro });
            return selected.length ? selected[0].nome : 'Não selecionado';
        }
        return '';
    };

    $scope.changeAterro = function (aterro, index) {
        if (aterro) {
            selected = $filter('filter')($scope.aterros, { id: aterro });
            $scope.operacaoPluviometrias[index].aterro = selected.length > 0 ? selected[0] : $scope.aterro;
        }
    };

    $scope.showUsuario = function (user) {
        if (user && $scope.usuarios.length) {
            var selected = $filter('filter')($scope.usuarios, { id: user.usuario.id });
            return selected.length ? selected[0].name : 'Not set';
        } else {
            return user.name || 'Not set';
        }
    };

    $scope.checkName = function (data, id) {
        if (id === 2 && data !== 'awesome') {
            return "Username 2 should be `awesome`";
        }
    };

    $scope.savePluviometria = function (rowform, index, data, id) {

        angular.extend(data, { id: id });
        angular.extend(data, { usuario: $scope.usuario.id });
        //var medicao = { data: data.dia + '/' + $scope.mes.id + '/' + $scope.ano.id, dia: data.dia, pluviometria: data.pluviometria, vazao: data.vazao, aterro: $scope.aterro, usuario: $scope.usuario.id, mes: $scope.mes.id, ano: $scope.ano.id };
        var medicao = { data: data.dia + '/' + $scope.mes.id + '/' + $scope.ano.id, dia: data.dia, pluviometria: data.pluviometria, vazao: data.vazao, aterro: data.aterro, usuario: $scope.usuario.id, mes: $scope.mes.id, ano: $scope.ano.id };
        if (undefined == id) {

            swal({
                title: "",
                text: "Você tem certeza que deseja inserir a medição ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Cancelar",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    $scope.getMedicao(medicao, function (result) {
                        if (null == result) {
                            medicao.usuario = $scope.usuario.id;
                            $http.post('/PluviometriaVazao', medicao).then(function (itemInserted) {
                                swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                                Materialize.toast('Registro inserido com sucesso!', 4000);
                                $scope.operacaoPluviometrias[index].id = itemInserted.data.id;
                                $scope.search();
                            }, function (error) {
                                swal("Erro", "Seu registro não foi inserido :(", "error");
                            });
                        } else {
                            swal("Erro", "Já existe uma medição para essa mesma data. :(", "error");
                            rowform.$cancel();
                            $scope.operacaoPluviometrias.splice(index, 1);
                            return false;
                        }
                    });
                } else {
                    rowform.$cancel();
                    swal("Cancelado", "Seu registro não foi editado :(", "error");
                }
            });

        } else {

            medicao.id = id;
            swal({
                title: "",
                text: "Você tem certeza que deseja editar a medição ?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Cancelar",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    $http.put('/PluviometriaVazao/' + medicao.id, medicao).then(function () {
                        swal("Registro Editado!", "Seu registro foi editado com sucesso.", "success");
                        Materialize.toast('Registro editado com sucesso!', 4000);
                        $scope.search();
                    }, function (error) {
                        swal("Erro", "Seu registro não foi editado :(", "error");
                    });

                } else {
                    swal("Cancelado", "Seu registro não foi editado :(", "error");
                }
            });

        }
    };

    $scope.cancel = function (index, rowform) {
        if ($scope.operacaoPluviometrias[index].id == undefined) {
            $scope.operacaoPluviometrias.splice(index, 1);
            return;
        }

        rowform.$cancel();
    };

    $scope.removePluviometria = function (index) {

        if ($scope.operacaoPluviometrias[index].id == undefined) {
            $scope.operacaoPluviometrias.splice(index, 1);
            return;
        }

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
        }, function (isConfirm) {
            if (isConfirm) {
                $scope.removeMedicao($scope.operacaoPluviometrias[index], function (d) {
                    $scope.operacaoPluviometrias.splice(index, 1);
                    swal("Registro Removido!", "Seu registro foi removido com sucesso.", "success");
                }, function (error) {
                    swal("Erro", "Seu registro não foi removido :(", "error");
                });
            } else {
                swal("Cancelado", "Seu registro não foi removido :(", "error");
            }
        }
      );
    };

    $scope.addPluviometria = function () {
        $scope.inserted = {
            dataMedicao: null,
            aterro: $scope.aterro,
            usuario: $scope.usuario,
            pluviometria: null,
            vazao: null
        };
        $scope.operacaoPluviometrias.push($scope.inserted);
    };
    

    $(".dropify").on('dropify.afterClear', function (e) {
        $scope.excel = ([]);
        $("#excel-data").hide();
    });
}]);
