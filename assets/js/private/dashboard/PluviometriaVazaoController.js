

app.controller('PluviometriaVazaoController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoPluviometrias = []; 
  $scope.mes = { id: 1};
  $scope.meses= [{ id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}];;
  $scope.ano = { id: 2016};
  $scope.anos = ([]);
  $scope.aterros = [];
  $scope.usuarios = [];  

  $scope.changeAno = function(ano) {
      
      $http.get('/PluviometriaVazao?where={ "mes": "' + $scope.mes.id + '","ano": "' + ano  + '"}').success(function(data) {
        console.log( angular.fromJson(data));
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
    var totalSendSuccess=0;
    var totalSendError =0 ;

  	alasql('SELECT * FROM FILE(?,{headers:true})',[event],function(res){
  		$scope.excel = angular.fromJson(res);// JSON.stringify(res);

      angular.forEach($scope.excel, function(registro, index){
        if(index != 0)
        {
          var registroPluviometria = { data: registro.A +'/' + $scope.mes.id + '/' + $scope.ano.id  , dia: registro.A, pluviometria: registro.B, vazao: registro.C, aterro: $scope.usuario._aterro, usuario: $scope.usuario._id, mes: $scope.mes.id , ano: $scope.ano.id };
          $http.post('/PluviometriaVazao', registroPluviometria, 
          function(result){
            totalSendSuccess+=1;
          }, function(error){
            swal("Erro", "Ocorreu uma falha ao importar o registro do dia '" + registro.A + "' :(", "error");
            totalSendError+=1;

          });

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
