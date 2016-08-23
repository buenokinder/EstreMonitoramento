
app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', 'sennitCommunicationService',   function($scope, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.inserted = {data:'', nomeTopografo:'',nomeAuxiliar:'',temperatura:'',obsGestor:''};
    $scope.medicoes = ([]);
    $scope.verMedicoes = false;
    $scope.verResumos = false;
    $scope.usuario = window.SAILS_LOCALS;
    $scope.refreshChilds = false;

    $scope.monitoramentos = {
      dataInicial:'',
      dataFinal:'',
      marcosSuperficiais:([]),
      marcosSuperficiaisSearch:([]),
      monitoramentos:([]),
      pesquisa: null,
      ordenacao:'dataInstalacao ASC',
      init: function(){
          $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' });

          var dtIni = (new Date(new Date().setDate(new Date().getDate()-30)));
          var dtFim = new Date();

          $scope.monitoramentos.dataInicial = getDateTimeString(dtIni);
          $scope.monitoramentos.dataFinal = getDateTimeString(dtFim);

          $http.get('/MarcoSuperficial').success(function(response, status){
              var marcosSuperficiais = [];
              for(var i=0;i<response.length;i++){
                marcosSuperficiais.push({id:response[i].id, name:response[i].nome, marker:response[i].nome, icon:'', ticked:false});
              }
              $scope.monitoramentos.marcosSuperficiais = marcosSuperficiais;               
          });

          $("#btMonitoramentos").on("click", function(e){
            e.preventDefault();
            document.location="#/MonitoramentoMarcoSuperficial"
          });
      },

      pesquisarResumo:function(marcosSuperficiais, callback){
          var query="?order="+$scope.monitoramentos.ordenacao;
          query+="&dtIni=1970-01-01";
          query += "&dtFim=" + getDateQuery(getDate(new Date()));
          query+="&ms="+marcosSuperficiais;

          $http.get('/MarcoSuperficial/monitoramentos/'+query).success(function(response, status){
               $scope.monitoramentos.resumo = response;
               callback();
          });    
      },

      pesquisar:function(){
          var query="?order="+$scope.monitoramentos.ordenacao;
          query += "&dtIni=" + getDateTimeStringQuery($("#dataInicial").val());
          query += "&dtFim=" + getDateTimeStringQuery($("#dataFinal").val());

          if(null!=$scope.monitoramentos.marcosSuperficiaisSearch && undefined != $scope.monitoramentos.marcosSuperficiaisSearch && $scope.monitoramentos.marcosSuperficiaisSearch.length>0){
            var ms="";
            angular.forEach($scope.monitoramentos.marcosSuperficiaisSearch, function(value, key){
              ms+= ((ms==""?"":",")+value.id);
            });
            query+="&ms="+ms;
          }

          $http.get('/MarcoSuperficial/monitoramentos/'+query).success(function(response, status){
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

      var ret = parseFloat(value.replace(',','.').replace('\r','').trim());

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

                      var params = $scope.inserted;
                      
                      if(params["data"].toString().indexOf("/")>=0){
                        var ret = params["data"].split('/');
                        data  = new Date(ret[2], parseInt(ret[1]-1), ret[0]);
                      }else{
                         data = new Date(params["data"]);
                      }
                
                      params["data"] = data;
                      
                      $http({
                          method: 'POST',
                          url: '/MedicaoMarcoSuperficial/',
                          data: params
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

    $scope.getCssClass = function (alerta) {
        if (null == alerta || undefined == alerta || '' == alerta.trim()) return;

      return (alerta.replace("ç","c").replace("ã","a").replace("á","a")).toLowerCase();
    }
    
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

    $scope.$on('handleBroadcast', function(e, type) {
      $scope.data = sennitCommunicationService.data;

      if(sennitCommunicationService.type=='select'){
        $scope.medicoes = ([]);
        $scope.inputClass = "active";
        $scope.verResumos =false;
        $scope.verMedicoes = true;
      }else{
        
        $scope.verMedicoes = false;
        $scope.monitoramentos.resumo = ([]);

        if($scope.data.medicaoMarcoSuperficialDetalhes.length>0){
          var ms="";
          var mss=[];

          angular.forEach($scope.data.medicaoMarcoSuperficialDetalhes, function(value, key){
            if(mss.indexOf(value.marcoSuperficial)<0){
              ms+= ((ms==""?"":",")+value.marcoSuperficial);
              mss.push(value.marcoSuperficial);
            }
          });
        
          $scope.monitoramentos.pesquisarResumo(ms, function(){
            $scope.verResumos =true;
          });
        }

      }
    }); 


    $(".dropify").on('dropify.afterClear', function(e){
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
