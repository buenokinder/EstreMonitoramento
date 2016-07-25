

app.controller('OperacaoSecaoCorteController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoPluviometrias = []; 
$http.get('/PluviometriaVazao').success(function(data) {
      $scope.operacaoPluviometrias = angular.fromJson(data);

    });
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
  $scope.secaoCortes = ([]);
  $scope.loadSecaoCorte = function() {
    return $scope.secaoCortes.length ? null : $http.get('/SecaoCorte').success(function(data) {
      $scope.secaoCortes = data;
    });
  };

    $scope.usuarios = [];
  $scope.loadUsuarios = function() {
    console.log('teste');
    return $scope.usuarios.length ? null : $http.get('/Usuario').success(function(data) {
      $scope.usuarios = data;
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
   
}]);
