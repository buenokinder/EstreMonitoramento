app.controller('PluviometriaVazaoController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoPluviometrias = []; 
  $scope.mes = { id: 1};
  $scope.meses= [{ id: 1, name:'Janeiro'}, {id: 2, name:'Fevereiro'}, {id: 3, name:'Março'}, {id: 4, name:'Abril'}, {id: 5, name:'Maio'}, {id: 6, name:'Junho'}, {id: 7, name:'Julho'}, {id: 8, name:'Agosto'}, {id: 9, name:'Setembro'}, {id: 10, name:'Outubro'}, {id: 11, name:'Novembro'}, {id: 12, name:'Dezembro'}];
  $scope.ano = { id: 2016};
  $scope.anos = ([]);
  $scope.anosToAssociateWithFile = ([]);
  $scope.anoAssociatedWithFile = ([]);
  $scope.mesAssociatedWithFile = ([]);  
  $scope.aterros = [];
  $scope.usuarios = [];  
  $scope.currentAno = (new Date()).getFullYear();
  $scope.totalSent=0;
  $scope.totalErrors =0 ;
  $scope.usuario = null;
  $scope.aterro = null;
  $scope.excel = ([]);

  $scope.search = function() {
      $http.get('/PluviometriaVazao/search?mes='+$scope.mes.id+'&ano='+$scope.ano.id).success(function(data) {
        $scope.operacaoPluviometrias = angular.fromJson(data);
      });
  };

  $scope.loadDistinctAnos = function(callback){
    $http.get('/PluviometriaVazao/listDistinctAnos').success(function(data) {
      if(data.length==0){
        $scope.anos =  [{id:$scope.currentAno}];  

        if(undefined!=callback){
          callback();
        }
        return;
      }

      $scope.anos = angular.fromJson(data);
      if(undefined!=callback){
        callback();
      }
    });
  };

  $scope.init = function(){
   
    $scope.loadDistinctAnos();
    $scope.loadAterros();
    $scope.loadUsuarios();
    $scope.ano = {id:$scope.currentAno};
    for(var i=2016;i<=$scope.currentAno;i++){
      $scope.anosToAssociateWithFile.push({id:i});
    }
  }

  $scope.loadAterros = function() {
    return $scope.aterros.length ? null : $http.get('/Aterro').success(function(data) {
      $scope.aterros = angular.fromJson(data); 

      for(var i=0;i<$scope.aterros.length;i++){
        if($scope.aterros[i].id==window.SAILS_LOCALS._aterro){
          $scope.aterro = $scope.aterros[i];
        }
      }

    });
  };
    
  $scope.loadUsuarios = function() {
    return $scope.usuarios.length ? null : $http.get('/Usuario').success(function(data) {
      $scope.usuarios = data;

      for(var i=0;i<$scope.usuarios.length;i++){
        if($scope.usuarios[i].id==window.SAILS_LOCALS._id){
          $scope.usuario = $scope.usuarios[i];
        }
      }
    });
  };
    
  $scope.uploadPluviometria = function(){
    $('.dropify').dropify({
      messages: {
          default: 'Arraste seu Arquivo',
      }
    });
    $('#modalPluviometria').openModal();
  };

  function checkStatusImport(){
    if($scope.totalSent==$scope.excel.length-1){
      Materialize.toast('Importação finalizada '+($scope.totalErrors>0?'com erros.':'')+'!', 4000);
      
      $scope.loadDistinctAnos(function(){
        $scope.ano = $scope.anoAssociatedWithFile;
        $scope.mes = $scope.mesAssociatedWithFile;
        $scope.search();
      });

      $scope.totalSent=0;
      $scope.totalErrors=0;
    }  
  }

  $scope.getMedicao = function(medicao, callback){
    $http.get('/PluviometriaVazao?where={ "dia": "' + medicao.dia + '","mes": "' + medicao.mes + '","ano": "' + medicao.ano   + '"}').success(function(data) {
      callback(data.length>0?angular.fromJson(data[0]):null);
    });
  };
  
  $scope.removeMedicao = function(medicao, callback, calbackError){
    $http.delete('/PluviometriaVazao/'+medicao.id, medicao).then(function(result) {
      callback(angular.fromJson(result.data));
    }, function(error){
      calbackError(error);      
    });
  };

  $scope.addMedicao = function(medicao) {

    $http.post('/PluviometriaVazao', medicao).then( 
      function(result){
        $scope.totalSent+=1;
        checkStatusImport();
      }, function(error){
        swal("Erro", "Ocorreu uma falha ao importar a medição do dia '" + medicao.data + "'. Verifique se já foi inserida uma medição para essa mesma data anteriormente. :(", "error");
        $scope.totalSent+=1;
        $scope.totalErrors+=1;
        checkStatusImport();
      });
  };

  $scope.loadFile = function() {
  	alasql('SELECT * FROM FILE(?,{headers:false})',[event],function(res){
  		$scope.excel = angular.fromJson(res);
      $("#excel-data").show();
      $scope.addMedicoes($scope.excel);
  	});
  };

  $scope.addMedicoes = function (medicoes){
      angular.forEach(medicoes, function(registro, index){
        if(index != 0)
        {
          var medicao = { data: registro.A +'/' + $scope.mesAssociatedWithFile.id + '/' + $scope.anoAssociatedWithFile.id  , dia: registro.A, pluviometria: registro.B, vazao: registro.C, aterro: $scope.aterro, usuario: $scope.usuario.id, mes: $scope.mesAssociatedWithFile.id , ano: $scope.anoAssociatedWithFile.id };

          $scope.getMedicao(medicao, function(result){
            if(null==result){
              $scope.addMedicao(medicao);
            }else{
              $scope.removeMedicao(result, function(){
                  $scope.addMedicao(medicao);
              }, function(){
                swal("Erro", "Ocorreu uma falha ao atualizar a medição do dia '" + medicao.dia + "/" + medicao.mes + "/" + medicao.ano + "'. :(", "error");      
              });
            }
          });
        }
      });    
  };

  $scope.showAterro = function(aterro) {
    if(aterro.aterro && $scope.aterros.length) {
      var selected = $filter('filter')($scope.aterros, {id: aterro.aterro.id});
      return selected.length ? selected[0].nome : 'Not set';
    } else {
      return aterro.nome || 'Not set';
    }
  };

  $scope.showUsuario = function(user) {
    if(user && $scope.usuarios.length) {
      var selected = $filter('filter')($scope.usuarios, {id: user.usuario.id});
      return selected.length ? selected[0].name : 'Not set';
    } else {
      return user.name || 'Not set';
    }
  };


  $scope.checkName = function(data, id) {
    if (id === 2 && data !== 'awesome') {
      return "Username 2 should be `awesome`";
    }
  };

  $scope.savePluviometria = function(rowform, index, data, id) {

    angular.extend(data, {id: id});
    angular.extend(data, {usuario: $scope.usuario.id});
    angular.extend(data, {aterro: $scope.aterro});

    var medicao = { data: data.dia +'/' + $scope.mes.id + '/' + $scope.ano.id  , dia: data.dia, pluviometria: data.pluviometria, vazao: data.vazao, aterro: $scope.aterro, usuario: $scope.usuario.id, mes: $scope.mes.id , ano: $scope.ano.id };
    if(undefined==id){

      swal({  title: "",   
              text: "Você tem certeza que deseja inserir a medição ?",   
              type: "warning",   
              showCancelButton: true, 
              confirmButtonText: "Sim",   
              cancelButtonText: "Cancelar",   
              closeOnConfirm: false,   
              closeOnCancel: false 
          },function(isConfirm){   
                  if (isConfirm) {    
                    $scope.getMedicao(medicao, function(result){
                      if(null==result){
                        $http.post('/PluviometriaVazao', medicao).then(function(itemInserted){
                          swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                          Materialize.toast('Registro inserido com sucesso!', 4000);  
                          $scope.operacaoPluviometrias[index].id = itemInserted.data.id;                     
                        }, function(error){
                          swal("Erro", "Seu registro não foi inserido :(", "error");  
                        });       

                          //$scope.operacaoPluviometrias[index].aterro = $scope.aterro;
                          //$scope.operacaoPluviometrias[index].usuario = $scope.usuario;

                      }else{
                        swal("Erro", "Já existe uma medição para essa mesma data. :(", "error");
                        rowform.$cancel();
                        $scope.operacaoPluviometrias.splice(index, 1);
                        return false;
                      }
                    });    
                  } else {
                    swal("Cancelado", "Seu registro não foi editado :(", "error");
                  } 
            }); 



    }else{

      medicao.id = id;
      swal({  title: "",   
              text: "Você tem certeza que deseja editar a medição ?",   
              type: "warning",   
              showCancelButton: true, 
              confirmButtonText: "Sim",   
              cancelButtonText: "Cancelar",   
              closeOnConfirm: false,   
              closeOnCancel: false 
          },function(isConfirm){   
                  if (isConfirm) {    
                    $http.put('/PluviometriaVazao/'+medicao.id, medicao).then(function(){
                      swal("Registro Editado!", "Seu registro foi editado com sucesso.", "success");
                      Materialize.toast('Registro editado com sucesso!', 4000);                       
                    }, function(error){
                      swal("Erro", "Seu registro não foi editado :(", "error");  
                    });       

                  } else {
                    swal("Cancelado", "Seu registro não foi editado :(", "error");
                  } 
            });        
       
    }
  };

  $scope.cancel  = function(index, rowform) { 
    if($scope.operacaoPluviometrias[index].id==undefined){
      $scope.operacaoPluviometrias.splice(index, 1);
      return;
    }

    rowform.$cancel();
  };

  $scope.removePluviometria = function(index) {
    
    if($scope.operacaoPluviometrias[index].id==undefined){
      $scope.operacaoPluviometrias.splice(index, 1);
      return;
    }

    swal({  title: "",   
              text: "Você tem certeza que deseja excluir a medição ?",   
              type: "warning",   
              showCancelButton: true, 
              confirmButtonText: "Sim",   
              cancelButtonText: "Cancelar",   
              closeOnConfirm: false,   
              closeOnCancel: false 
          },function(isConfirm){   
                  if (isConfirm) {     
                    $scope.removeMedicao($scope.operacaoPluviometrias[index], function(d){
                      $scope.operacaoPluviometrias.splice(index, 1);
                      swal("Registro Removido!", "Seu registro foi removido com sucesso.", "success");
                      Materialize.toast('Registro inserido com sucesso!', 4000);                        
                    }, function(error){
                        swal("Erro", "Seu registro não foi removido :(", "error");  
                    });
                  } else {
                    swal("Cancelado", "Seu registro não foi removido :(", "error");
                  } 
            }
      );      
  };

  $scope.addPluviometria = function() {
    $scope.inserted = {
      dataMedicao: null,
      aterro: $scope.aterro,
      usuario: $scope.usuario,
      pluviometria: null,
      vazao: null 
    };
    $scope.operacaoPluviometrias.push($scope.inserted);
  };


  $(".dropify").on('dropify.afterClear', function(e){
    $scope.excel = ([]);
    $("#excel-data").hide();
  });
}]);
