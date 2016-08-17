
app.controller('PluviometriaVazaoController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoPluviometrias = []; 
  $scope.mes = { id: 1};
  $scope.meses= [{ id: 1, name:'Janeiro'}, {id: 2, name:'Fevereiro'}, {id: 3, name:'Março'}, {id: 4, name:'Abril'}, {id: 5, name:'Maio'}, {id: 6, name:'Junho'}, {id: 7, name:'Julho'}, {id: 8, name:'Agosto'}, {id: 9, name:'Setembro'}, {id: 10, name:'Outubro'}, {id: 11, name:'Novembro'}, {id: 12, name:'Dezembro'}];
  $scope.ano = { id: 2016};
  $scope.anos = ([]);
  $scope.aterros = [];
  $scope.usuarios = [];  
  $scope.currentYear = (new Date()).getFullYear();
  $scope.totalSent=0;
  $scope.totalErrors =0 ;

  $scope.search = function() {
      //$http.get('/PluviometriaVazao?sort=data ASC&where={ "mes": "' + $scope.mes.id + '","ano": "' + $scope.ano.id   + '"}').success(function(data) {
      $http.get('/PluviometriaVazao/search?mes='+$scope.mes.id+'&ano='+$scope.ano.id).success(function(data) {
        $scope.operacaoPluviometrias = angular.fromJson(data);
      });
  };

  $scope.loadDistinctAnos = function(){
    $http.get('/PluviometriaVazao/listDistinctAnos').success(function(data) {
      if(data.length==0){
        $scope.anos =  [{id:$scope.currentYear}];  
        return;
      }

      $scope.anos = angular.fromJson(data);

    });
  };

  $scope.init = function(){
    $scope.loadDistinctAnos();
    $scope.loadAterros();
    $scope.loadUsuarios();
    $scope.usuario = window.SAILS_LOCALS;
    $scope.ano = {id:$scope.currentYear};
    $scope.excel;
  }

  $scope.loadAterros = function() {
    return $scope.aterros.length ? null : $http.get('/Aterro').success(function(data) {
      $scope.aterros = angular.fromJson(data); 
    });
  };
    
  $scope.loadUsuarios = function() {
    return $scope.usuarios.length ? null : $http.get('/Usuario').success(function(data) {
      $scope.usuarios = data;
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
      $scope.search();
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
      $scope.addMedicoes($scope.excel);
  	});
  };

  $scope.addMedicoes = function (medicoes){
      angular.forEach(medicoes, function(registro, index){
        if(index != 0)
        {
          var medicao = { data: registro.A +'/' + $scope.mes.id + '/' + $scope.ano.id  , dia: registro.A, pluviometria: registro.B, vazao: registro.C, aterro: $scope.usuario._aterro, usuario: $scope.usuario._id, mes: $scope.mes.id , ano: $scope.ano.id };

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
    angular.extend(data, {usuario: $scope.usuario._id});
    angular.extend(data, {aterro: $scope.usuario._aterro});

    var medicao = { data: data.dia +'/' + $scope.mes.id + '/' + $scope.ano.id  , dia: data.dia, pluviometria: data.pluviometria, vazao: data.vazao, aterro: $scope.usuario._aterro, usuario: $scope.usuario._id, mes: $scope.mes.id , ano: $scope.ano.id };
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
                        $http.post('/PluviometriaVazao', medicao).then(function(){
                          swal("Registro Inserido!", "Seu registro foi inserido com sucesso.", "success");
                          Materialize.toast('Registro inserido com sucesso!', 4000);                       
                        }, function(error){
                          swal("Erro", "Seu registro não foi inserido :(", "error");  
                        });       
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
      aterro: null,
      usuario: null,
      pluviometria: null,
      vazao: null 
    };
    $scope.operacaoPluviometrias.push($scope.inserted);
  };
  
  $scope.init();

}]);
