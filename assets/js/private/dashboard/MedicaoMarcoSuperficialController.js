app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', 'sennitCommunicationService',   function($scope, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.inserted = {data:'', nomeTopografo:'',nomeAuxiliar:'',temperatura:'',obsGestor:''};
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;

    $scope.monitoramentos = {
      dataInicial:new Date(new Date().setDate(new Date().getDate()-30)),
      dataFinal:new Date(),
      marcoSuperficial:([]),
      marcosSuperficiais:([]),
      monitoramentos:([]),
      pesquisa: ([]),
      init: function(){
          $http.get('/MarcoSuperficial').success(function(response, status){
               $scope.monitoramentos.marcosSuperficiais = response;
          });
      },

      pesquisar:function(){

          $http.get('/MarcoSuperficial/monitoramentos').success(function(response, status){
               $scope.monitoramentos.pesquisa = response;
          });        
      }
    };

    $scope.monitoramentos.init();

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

    $scope.createMarcoSuperficial = function(marcoSuperficial, callback){
          $http.post('/MarcoSuperficial', marcoSuperficial).success(function(response, status){
              callback(response, status);
          }).error(function(err, status){
              swal("Erro", "Ocorreu uma falha ao importar o marco superficial '" + marcoSuperficial.nome + "' :(", "error");
              callback(err, status);
          }); 
    };

    $scope.getMarcoSuperficial = function(medicaoMarcoSuperficialDetalhes, callback) {
      $http.get('/MarcoSuperficial/?nome='+medicaoMarcoSuperficialDetalhes.nome).success(function (response, status) {

          if(null==response || response.length==0){
            var marcosuperficial={};
            marcosuperficial.nome = medicaoMarcoSuperficialDetalhes.nome;
            marcosuperficial.leste = medicaoMarcoSuperficialDetalhes.leste;
            marcosuperficial.norte = medicaoMarcoSuperficialDetalhes.norte;
            marcosuperficial.cota = medicaoMarcoSuperficialDetalhes.cota;
            marcosuperficial.habilitado = true;
            marcosuperficial.dataInstalacao = medicaoMarcoSuperficialDetalhes.data;
            marcosuperficial.aterro = medicaoMarcoSuperficialDetalhes.aterro;

            $scope.createMarcoSuperficial(marcosuperficial, callback);
          }else{
            callback(response[0], status);  
          }
          
      }).error(function (err, status) {
          callback(err, status);
      });
    };

    $scope.saveMedicaoMarcoSuperficialDetalhes = function(medicaoMarcoSuperficialDetalhes){
      
      medicaoMarcoSuperficialDetalhes.owner = $scope.data;
      medicaoMarcoSuperficialDetalhes.data = medicaoMarcoSuperficialDetalhes.owner.data;

      $scope.getMarcoSuperficial(medicaoMarcoSuperficialDetalhes, function(marcoSuperficial, status){
          if(null!=marcoSuperficial && undefined!=marcoSuperficial){

            medicaoMarcoSuperficialDetalhes['marcoSuperficial'] = marcoSuperficial;

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

    function parseMedicao(value){
      if(undefined == value || null==value || value=='')return 0;

      var ret = parseFloat(value.replace('\r','').trim());

      return ret;
    }
    $scope.showContent = function($fileContent){

        var extractMedicaoMarcoSuperficialDetalhes = function(ret){
            $scope.medicoes = ([]);
            var linhas = $fileContent.split('\n');  

            for(var i = 0;i < linhas.length;i++){
                var linha = linhas[i];
                var colunas = linha.split(';');
                
                if(colunas.length <4) continue;

                var medicao = {'nome': colunas[0] , 'norte': parseMedicao(colunas[1]), 'leste': parseMedicao(colunas[2]) , 'cota': parseMedicao(colunas[3])};
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
