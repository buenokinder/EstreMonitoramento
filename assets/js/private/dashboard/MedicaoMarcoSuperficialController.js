app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', 'sennitCommunicationService',   function($scope, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.inserted = {data:'', nomeTopografo:'',nomeAuxiliar:'',temperatura:'',obsGestor:''};
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;

    $scope.removeFile = function(){
        $scope.deleteAllDetalhes({id:$scope.data.id}, function(){
          $scope.medicoes = ([]);
          $scope.refreshChilds = true;
          $scope.content = null;
          swal("Arquivo Removido!", "Arquivo removido com sucesso.", "success");
        }, function(){
          swal("Erro", "Ocorreu uma falha ao remover o arquivo :(", "error");
        });
    };

    $scope.getMarcoSuperficial = function(nomeMarcosuperficial, callback) {
      $http.get('/MarcoSuperficial/?nome='+nomeMarcosuperficial).success(function (response, status) {

          //if(null==ret || ret.length==0){
            //$scope.createMarcoSuperficial(marco, callback);
          //}else{
            callback(response, status);  
          //}
          
      }).error(function (err, status) {
          callback(err, status);
      });
    };

    $scope.saveMedicaoMarcoSuperficialDetalhes = function(medicaoMarcoSuperficialDetalhes){

      $scope.getMarcoSuperficial(medicaoMarcoSuperficialDetalhes.nome, function(ret, status){

          if(null!=ret && ret.length>0){

            medicaoMarcoSuperficialDetalhes['marcoSuperficial'] = ret[0];
            medicaoMarcoSuperficialDetalhes['owner'] = $scope.data;

            $http.post('/MedicaoMarcoSuperficialDetalhes', medicaoMarcoSuperficialDetalhes).success(function(data, status){
                $scope.refreshChilds = true;
                $scope.medicoes.push(medicaoMarcoSuperficialDetalhes);
            }).error(function(data, status){
                swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(", "error");
            }); 
          }else{
            swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoMarcoSuperficialDetalhes.nome + "' :(", "error");
          }
      });
    };

    $scope.showContent = function($fileContent){

        var extractMedicaoMarcoSuperficialDetalhes = function(ret){
            $scope.medicoes = ([]);
            var linhas = $fileContent.split('\n');  

            for(var i = 0;i < linhas.length;i++){
                var linha = linhas[i];
                var colunas = linha.split(';');
                
                if(colunas.length <4) continue;

                var medicao = {'nome': colunas[0] , 'norte': colunas[1], 'leste': colunas[2] , 'cota': colunas[3]};
                var medicaoMarcoSuperficialDetalhes = {'nome': medicao.nome , 'norte': medicao.norte, 'leste': medicao.leste , 'cota': medicao.cota, 'aterro': $scope.usuario._aterro };
                
                $scope.saveMedicaoMarcoSuperficialDetalhes(medicaoMarcoSuperficialDetalhes);
            }
            $scope.content = $fileContent;
        };

        var erro = function(err){
          swal("Erro", "Ocorreu uma falha ao importar o arquivo :(", "error");
        };

        $scope.deleteAllDetalhes({id:$scope.data.id}, extractMedicaoMarcoSuperficialDetalhes, erro);
    };

    $scope.deleteAllDetalhes = function (data, callback){
      $http.post('/MedicaoMarcoSuperficialDetalhes/deleteall', data).success(function (response) {
          callback(response, null);
      }).error(function (err, status) {
          callback(err, status);
      });
    };

    $scope.closeMedicao = function(){
      $('#modalView').closeModal();
    };

    $scope.addMedicao = function (){
      swal({  title: "",   
              text: "Você tem certeza que deseja inserir a medição ?",   
              type: "warning",   
              showCancelButton: true, 
              confirmButtonText: "Sim",   
              cancelButtonText: "Cancelar",   
              closeOnConfirm: false,   
              closeOnCancel: false }, 
              function(isConfirm){   
                  if (isConfirm) {     
                      $http({
                          method: 'POST',
                          url: '/MedicaoMarcoSuperficial/',
                          data: $scope.inserted
                      }).then(function onSuccess(sailsResponse){
                          $scope.inputClass = null;
                          $scope.inputClass = "disabled";
                          $scope.refreshChilds = true;
                          $scope.verMedicoes = false;
                          $scope.closeMedicao();
                          $scope.inserted = {data:'', nomeTopografo:'',nomeAuxiliar:'',temperatura:'',obsGestor:''};
                          swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                          Materialize.toast('Registro inserido com sucesso!', 4000);
                      })
                      .catch(function onError(sailsResponse){

                      })
                      .finally(function eitherWay(){
                          $scope.sennitForm.loading = false;
                      })
                  } else {
                          swal("Cancelado", "Seu registro não foi inserido :(", "error");
                  } 
              }
      );   
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
                            data: {'obsOperacional': $scope.data.obsOperacional}
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

    $(".dropify").on('dropify.afterClear', function(e){
      $scope.removeFile();
    });


    $(".dropify").on('afterClear', function(e){
      console.log("file removed --");
      $scope.removeFile();
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
