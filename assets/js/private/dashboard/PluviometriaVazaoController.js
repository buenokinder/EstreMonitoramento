

app.controller('PluviometriaVazaoController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
$scope.operacaoPluviometrias = [
    {id: 1, data: '10/03/2016', user: 2, aterro: '5761a8e7da7ff9f64af436a5', pluviometria: 12, vazao: 15},
    {id: 1, data: '15/03/2016', user: 2, aterro: '5761a8e7da7ff9f64af436a5', pluviometria: 32, vazao: 12},
    {id: 1, data: '17/03/2016', user: 2, aterro: '5761a966da7ff9f64af436a6', pluviometria: 52, vazao: 11}
  ]; 



  $scope.aterros = [];
  $scope.loadAterros = function() {
    return $scope.aterros.length ? null : $http.get('/Aterro').success(function(data) {
      $scope.aterros = data;
    });
  };

    $scope.usuarios = [];
  $scope.loadUsuarios = function() {
    return $scope.usuarios.length ? null : $http.get('/Usuario').success(function(data) {
      $scope.usuarios = data;
    });
  };

  $scope.showAterro = function(aterro) {
    if(aterro.aterro && $scope.aterros.length) {
      var selected = $filter('filter')($scope.aterros, {id: aterro.id});
      return selected.length ? selected[0].text : 'Not set';
    } else {
      return aterro.nome || 'Not set';
    }
  };

  $scope.showUsuario = function(user) {
    if(user.aterro && $scope.aterros.length) {
      var selected = $filter('filter')($scope.usuarios, {id: user.id});
      return selected.length ? selected[0].text : 'Not set';
    } else {
      return aterro.nome || 'Not set';
    }
  };

  $scope.checkName = function(data, id) {
    if (id === 2 && data !== 'awesome') {
      return "Username 2 should be `awesome`";
    }
  };

  $scope.saveUser = function(data, id) {
    //$scope.user not updated yet
    angular.extend(data, {id: id});
    return $http.post('/saveUser', data);
  };

  // remove user
  $scope.removeUser = function(index) {
    $scope.operacaoPluviometrias.splice(index, 1);
  };

  // add user
  $scope.addUser = function() {
    $scope.inserted = {
      id: $scope.operacaoPluviometrias.length+1,
      user: null,
      pluviometria: null,
      vazao: null 
    };
    $scope.operacaoPluviometrias.push($scope.inserted);
  };
   
}]);
