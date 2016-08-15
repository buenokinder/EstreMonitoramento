app.controller('MedicaoPiezometroController', ['$scope','$interval', '$http', 'sennitCommunicationService',   function($scope, $interval, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.inserted = {data:'', piezometro:([])};
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;

    $scope.monitoramentos = {
      dataInicial:'',
      dataFinal:'',
      piezometro:([]),
      piezometros:([]),
      monitoramentos:([]),
      pesquisa: null,
      ordenacao:'dataInstalacao ASC',


      init: function(){

          var getDatePtBr = function(date){
            if(null==date || undefined == date || ''==date)
                return '';

              var value = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();

             return value;
          };

          var dtIni = (new Date(new Date().setDate(new Date().getDate()-30)));
          var dtFim = new Date();

          $scope.monitoramentos.dataInicial = getDatePtBr(dtIni);
          $scope.monitoramentos.dataFinal = getDatePtBr(dtFim);

          $http.get('/Piezometro').success(function(response, status){
               $scope.monitoramentos.piezometros = response;
          });

          $("#btMonitoramentos").on("click", function(e){
            e.preventDefault();
            document.location="#/MonitoramentoPiezometro"
          });
      },

      pesquisar:function(){
          var query="?order="+$scope.monitoramentos.ordenacao;

          var getDateQuery = function(date){
            if(null==date || undefined == date || ''==date)
                return '';

             var value = date.split('/');
             return value[2] + '-' + value[1] + '-' + value[0];
          }

          query+="&dtIni="+getDateQuery($scope.monitoramentos.dataInicial);
          query+="&dtFim="+getDateQuery($scope.monitoramentos.dataFinal);

          if(null!=$scope.monitoramentos.piezometro && undefined != $scope.monitoramentos.piezometro && ''!=$scope.monitoramentos.piezometro){
            query+="&pz="+$scope.monitoramentos.piezometro;
          }

          $http.get('/piezometro/monitoramentos/'+query).success(function(response, status){
               $scope.monitoramentos.pesquisa = response;
                setInterval(function(){
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

    $scope.monitoramentoPiezometro = function(piezometro){
      var data = angular.fromJson(piezometro);
      var salienciaInicialEstimada = 1 -data.salienciaInicial;


      /*if (data.Prolongamento_Corte atual=""-\"  " ou "0" )=Prondidade_Descontando_Cortes anterior
      Se (Prolongamento_Corte atual≠""-\" " ou 0)=(Prondidade_Descontando_Cortes anterior+Prolongamento_Corte)
*/


    };

    $scope.createPiezometro = function(Piezometro, callback){
          $http.post('/Piezometro', Piezometro).success(function(response, status){
              callback(response, status);
          }).error(function(err, status){
              swal("Erro", "Ocorreu uma falha ao importar o marco superficial '" + Piezometro.nome + "' :(", "error");
              callback(err, status);
          }); 
    };

    $scope.getPiezometro = function(medicaoPiezometroDetalhes, callback) {
      $http.get('/Piezometro/?nome='+medicaoPiezometroDetalhes.nome).success(function (response, status) {

          if(null==response || response.length==0){
            var Piezometro={};
            Piezometro.nome = medicaoPiezometroDetalhes.nome;
            Piezometro.leste = medicaoPiezometroDetalhes.leste;
            Piezometro.norte = medicaoPiezometroDetalhes.norte;
            Piezometro.cota = medicaoPiezometroDetalhes.cota;
            Piezometro.habilitado = true;
            Piezometro.dataInstalacao = medicaoPiezometroDetalhes.data;
            Piezometro.aterro = medicaoPiezometroDetalhes.aterro;

            $scope.createPiezometro(Piezometro, callback);
          }else{
            callback(response[0], status);  
          }
          
      }).error(function (err, status) {
          callback(err, status);
      });
    };

    $scope.saveMedicaoPiezometroDetalhes = function(medicaoPiezometroDetalhes){
      
      medicaoPiezometroDetalhes.owner = $scope.data;
      medicaoPiezometroDetalhes.data = medicaoPiezometroDetalhes.owner.data;

      $scope.getPiezometro(medicaoPiezometroDetalhes, function(Piezometro, status){
          if(null!=Piezometro && undefined!=Piezometro){

            medicaoPiezometroDetalhes['Piezometro'] = Piezometro;

            $http.post('/MedicaoPiezometroDetalhes', medicaoPiezometroDetalhes).success(function(data, status){
                $scope.refreshChilds = true;
                $scope.medicoes.push(medicaoPiezometroDetalhes);
            }).error(function(data, status){
                swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoPiezometroDetalhes.nome + "' :(", "error");
            }); 
          }else{
            swal("Erro", "Ocorreu uma falha ao importar o marco '" + medicaoPiezometroDetalhes.nome + "' :(", "error");
          }
      });
    };

    function parseMedicao(value){
      if(undefined == value || null==value || value=='')return 0;

      var ret = parseFloat(value.replace('\r','').trim());

      return ret;
    }
    $scope.showContent = function($fileContent){

        var extractMedicaoPiezometroDetalhes = function(ret){
            $scope.medicoes = ([]);
            var linhas = $fileContent.split('\n');  

            for(var i = 0;i < linhas.length;i++){
                var linha = linhas[i];
                var colunas = linha.split(';');
                
                if(colunas.length <4) continue;

                var medicao = {'nome': colunas[0] , 'norte': parseMedicao(colunas[1]), 'leste': parseMedicao(colunas[2]) , 'cota': parseMedicao(colunas[3])};
                var medicaoPiezometroDetalhes = {'nome': medicao.nome , 'norte': medicao.norte, 'leste': medicao.leste , 'cota': medicao.cota, 'aterro': $scope.usuario._aterro };
                
                $scope.saveMedicaoPiezometroDetalhes(medicaoPiezometroDetalhes);
            }
            $scope.content = $fileContent;
        };

        var erro = function(err){
          swal("Erro", "Ocorreu uma falha ao importar o arquivo :(", "error");
        };

        $scope.deleteAllDetalhes({id:$scope.data.id}, extractMedicaoPiezometroDetalhes, erro);
    };

    $scope.deleteAllDetalhes = function (data, callback){
      $http.post('/MedicaoPiezometroDetalhes/deleteall', data).success(function (response) {
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
                          url: '/MedicaoPiezometro/',
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
                            url: '/MedicaoPiezometro/' + $scope.data.id,
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
