

app.controller('PluviometriaVazaoController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoPluviometrias = []; 
  $scope.mes = { id: 1};
  $scope.meses= [{ id: 1, name:'Janeiro'}, {id: 2, name:'Fevereiro'}, {id: 3, name:'Março'}, {id: 4, name:'Abril'}, {id: 5, name:'Maio'}, {id: 6, name:'Junho'}, {id: 7, name:'Julho'}, {id: 8, name:'Agosto'}, {id: 9, name:'Setembro'}, {id: 10, name:'Outubro'}, {id: 11, name:'Novembro'}, {id: 12, name:'Dezembro'}];;
  $scope.ano = { id: 2016};
  $scope.anos = ([]);
  $scope.aterros = [];
  $scope.usuarios = [];  

  $scope.changeAno = function(ano) {
      $http.get('/PluviometriaVazao?where={ "mes": "' + $scope.mes.id + '","ano": "' + ano  + '"}').success(function(data) {
        $scope.operacaoPluviometrias = angular.fromJson(data);
      });
  };

  $scope.loadDistinctAnos = function(){
    $http.get('/PluviometriaVazao/listDistinctAnos').success(function(data) {
      $scope.anos = angular.fromJson(data);
    });
  };

  $scope.init = function(){
    $scope.loadDistinctAnos();
    $scope.loadAterros();
    $scope.loadUsuarios();
    $scope.usuario = window.SAILS_LOCALS;
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

  $scope.loadFile = function() {
    var totalSent=0;
    var totalErrors =0 ;
    var checkImport = function(totalToSend, totalSent, totalErrors){
      if(totalSent==totalToSend){
        Materialize.toast('Importação finalizada '+(totalErrors>0?'com erros.':'')+'!', 4000);
        $scope.changeAno($scope.ano.id);
      }  
    };

  	alasql('SELECT * FROM FILE(?,{headers:false})',[event],function(res){
  		$scope.excel = angular.fromJson(res);

      angular.forEach($scope.excel, function(registro, index){
        if(index != 0)
        {
          var registroPluviometria = { data: registro.A +'/' + $scope.mes.id + '/' + $scope.ano.id  , dia: registro.A, pluviometria: registro.B, vazao: registro.C, aterro: $scope.usuario._aterro, usuario: $scope.usuario._id, mes: $scope.mes.id , ano: $scope.ano.id };
          $http.post('/PluviometriaVazao', registroPluviometria, 
            function(result){
              totalSent+=1;
              checkImport($scope.excel.length-1, totalSent, totalErrors);

            }, function(error){
              swal("Erro", "Ocorreu uma falha ao importar o registro do dia '" + registro.A + "' :(", "error");
              totalSent+=1;
              totalErrors+=1;
              checkImport($scope.excel.length-1, totalSent, totalErrors);
            }
          );
        }
      });
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
      console.log({id: user.usuario.id});
      console.log($scope.usuarios);
      
      var selected = $filter('filter')($scope.usuarios, {id: user.usuario.id});
      console.log(selected);
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

  $scope.savePluviometria = function(data, id) {

    angular.extend(data, {id: id});
    console.log(data);
    return $http.post('/PluviometriaVazao', data);
  };


  $scope.removePluviometria = function(index) {
    $scope.operacaoPluviometrias.splice(index, 1);
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
