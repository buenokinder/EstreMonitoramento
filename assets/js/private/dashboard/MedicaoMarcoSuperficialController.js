app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', 'sennitCommunicationService',   function($scope, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.usuario = window.SAILS_LOCALS;
    
    $scope.showContent = function($fileContent){
        var upload = function(ret){
            var linhas = $fileContent.split('\n');
            for(var i = 0;i < linhas.length;i++){
                var linha = linhas[i];
                var colunas = linha.split(';');
                var medicao = {'nome': colunas[0] , 'norte': colunas[1], 'leste': colunas[2] , 'cota': colunas[3]};
                var params = {'marcoSuperficial':$scope.data, 'nome': medicao.nome , 'norte': medicao.norte, 'leste': medicao.leste , 'cota': medicao.cota, 'aterro': $scope.usuario._aterro };
                $scope.medicoes.push(medicao);

                $http.post('/MedicaoMarcoSuperficialDetalhes', params).success(function(data, status){
       
                }).error(function(data, status){
                    swal("Erro", "Ocorreu uma falha ao importar o arquivo :(", "error");
                });
            }
            $scope.content = $fileContent;
        };

        var erro = function(err){
          swal("Erro", "Ocorreu uma falha ao importar o arquivo :(", "error");
        };

        $scope.deleteAllDetalhes({id:$scope.data.id}, upload, erro);
    };

    $scope.deleteAllDetalhes = function (data, callback){
      $http.post('/MedicaoMarcoSuperficialDetalhes/deleteall', data).success(function (response) {
          callback(response, null);
      }).error(function (err, status) {
          callback(err, status);
      });
    };

    $scope.removeFile = function (){
        $scope.deleteAllDetalhes({id:$scope.data.id}, function(){
          $scope.medicoes = ([]);
          swal("Arquivo Removido!", "Arquivo removido com sucesso.", "success");
        }, function(){
          swal("Erro", "Ocorreu uma falha ao remover o arquivo :(", "error");
        });

    };


    $scope.saveObsOperacional = function (){
        swal({  title: "",   
                text: "Você tem certeza que deseja inserir a observação ?",   
                type: "warning",   
                showCancelButton: true, 
                confirmButtonText: "Sim",   
                cancelButtonText: "Cancelar",   
                closeOnConfirm: false,   
                closeOnCancel: false }, 
                function(isConfirm){   
                    if (isConfirm) {     
                        $http({
                            method: 'PUT',
                            url: '/MedicaoMarcoSuperficial/' + $scope.data.id,
                            data: $scope.data
                        }).then(function onSuccess(sailsResponse){
                            $scope.inputClass = null;
                            $scope.inputClass = "disabled";
                            swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                            Materialize.toast('Registro alterado com sucesso!', 4000);
                        })
                        .catch(function onError(sailsResponse){

                        })
                        .finally(function eitherWay(){
                            $scope.sennitForm.loading = false;
                        })
                    } else {
                            swal("Cancelado", "Seu registro não foi alterado :(", "error");
                    } 
                }
        );   
    };

    $scope.$on('handleBroadcast', function() {
      $scope.data = sennitCommunicationService.data;
      $scope.inputClass = "active";
      $scope.verMedicoes = true;
    }); 

    $scope.uploadDetalhes = function(){
       $('.dropify').dropify({
              messages: {
                  default: 'Arraste seu Arquivo',
              }
          });
        $('#modalUpload').openModal();
    };


    $scope.addNewMapa = function(){
      $('#modalMedicaoUpload').openModal();
    };

}]);
