

app.controller('OperacaoSecaoCorteController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoSecaoCortes = []; 
  $scope.usuario = window.SAILS_LOCALS;

  $http.get('/Usuario').success(function(data) {
      $scope.usuarios = angular.fromJson(data);
    });
    $http.get('/Aterro').success(function(data) {
      $scope.aterros = data;
    });

  $scope.aterros = [];
  $scope.loadAterros = function() {
    return $scope.aterros.length ? null : $http.get('/Aterro').success(function(data) {
      $scope.aterros = data;
    });
  };

  $http.get('/SecaoCorte').success(function(data) {
      $scope.secaoCortes = data;
      
    });


   $scope.secaoCortes = ([]);
  $scope.init = function(){

    $http.get('/OperacaoSecaoCorte').success(function(data) {
      $scope.operacaoSecaoCortes = angular.fromJson(data);

    });
  };
  $scope.loadSecaoCorte = function() {
    return $scope.secaoCortes.length ? null : $http.get('/SecaoCorte').success(function(data) {
      $scope.secaoCortes = data;
      
    });
  };



$scope.showSecaoCorte = function(data) {
  console.log( $scope.secaoCortes.length);
    if(data.secaoCorte && $scope.secaoCortes.length) {
      var selected = $filter('filter')($scope.secaoCortes, {id: data.secaoCorte.id});
      return selected.length ? selected[0].nome : 'Not set';
    } else {
      return data.nome || 'Not set';
    }
  };

  $scope.checkName = function(data, id) {
    if (id === 2 && data !== 'awesome') {
      return "Username 2 should be `awesome`";
    }
  };

  $scope.saveSecaoCorte = function(data, id) {

    angular.extend(data, {id: id});
    angular.extend(data, {dataMedicao: new Date()});
    console.log(data);
    return $http.post('/OperacaoSecaoCorte', data);
  };

$scope.dataAtualFormatada = function(data){
    
    var dia = data.getDate();
    if (dia.toString().length == 1)
      dia = "0"+dia;
    var mes = data.getMonth()+1;
    if (mes.toString().length == 1)
      mes = "0"+mes;
    var ano = data.getFullYear();  
    return dia+"/"+mes+"/"+ano;
}
  $scope.removeSecaoCorte = function(index) {
    $scope.operacaoSecaoCortes.splice(index, 1);
  };

  $scope.addSecaoCorte = function() {
    $scope.inserted = {
      dataMedicao: new Date(),
      aterro: $scope.usuario._aterro,
      usuario: $scope.usuario._id,
      tipoEstaca: null,
      altura: null ,
      comprimento: null
    };
    $scope.operacaoSecaoCortes.push($scope.inserted);
  };
   
}]);
