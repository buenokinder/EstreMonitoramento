
app.controller('DashboardController', [ '$scope', '$location', '$rootScope', function($scope, $location, $rootScope){  
  $scope.pai = undefined;
  $scope.pathname = undefined;
  $scope.link = "";

  $scope.$watch('$routeUpdate', function(){
    $scope.link = $location.path();
    $scope.alteraStatusBreadcrumbs($location.path());
  });

  //$scope.isAdmin =  window.SAILS_LOCALS.me.isAdmin;
  $scope.goto = function(path){
    $location.path(path);
    $scope.alteraStatusBreadcrumbs(path);
  }

  $scope.alteraStatusBreadcrumbs = function(pathname) {    
    switch(pathname) {
         case "/PluviometriaVazao":
        $scope.pathname = "Pluviometria e Vazão";
        $scope.pai = "Area de Trabalho";
        break;
      case "/Dashboard":
        $scope.pathname = "Dashboard";
        $scope.pai = undefined;
        break;
      case '/Alerta' :
        $scope.pathname = "Alerta";
        $scope.pai = "Dados Mestre";
        break;
      case '/Aterro' :
        $scope.pathname = "Aterro";
        $scope.pai = "Dados Mestre";
        break;
      case '/LinhaCorte' :
        $scope.pathname = "Linha de Corte";
        $scope.pai = "Dados Mestre";
        break;
      case '/MarcoSuperficial' :
        $scope.pathname = "Marco Superficial";
        $scope.pai = "Dados Mestre";
        break;  
      case '/Piezometro' :
        $scope.pathname = "Piezometro";
        $scope.pai = "Dados Mestre";
        break;
      case '/Usuario' :
        $scope.pathname = "Usuário";
        $scope.pai = "Administração";
        break;
      case '/':
        $scope.pai = undefined;
        $scope.pathname = undefined;        
    }    
  };  
}]);

//TimeSheet Controllers

//End TimeSheet Controllers

//Project Controllers




app.controller('ativosController', ['$scope', '$http', function($scope, $http){
  $scope.ativos = [];

     $scope.price = [];

  $scope.tipo = [];

  $scope.tipos = [];
  $scope.usuario = [];
	$scope.timesheetForm = {
		loading: false
	}

  $scope.init = function(){
    $http.get("ativo").then(function(results) {
      $scope.ativos = angular.fromJson(results.data);
    });

      
    $http.get("user").then(function(results) {
      $scope.users = angular.fromJson(results.data);
    });

      
    $http.get("tipoativo").then(function(results) {
      $scope.tipos = angular.fromJson(results.data);
    });
  };

  $scope.gravarAtivos = function(){
    console.log($scope.ativos);
      // Set the loading state (i.e. show loading spinner)
		$scope.timesheetForm.loading = true;

		// Submit request to Sails.
		$http.post('/ativo', {
			name: $scope.ativo.name,
			serialNumber: $scope.ativo.serialNumber,
			assetNumber: $scope.ativo.assetNumber,
			model: $scope.ativo.model,
			size: $scope.ativo.size,
      price: $scope.ativo.price,
      description: $scope.ativo.description,
      type: $scope.tipo,
      owner: $scope.usuario
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/#/asset';
		})
		.catch(function onError(sailsResponse){

		

		})
		.finally(function eitherWay(){
			$scope.timesheetForm.loading = false;
		})
   
  };
  

}]);


app.controller('ativosUpdateController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
  $scope.ativo = [];
  $scope.tipos = [];
  $scope.users = [];
	$scope.timesheetForm = {
		loading: false
	}

  $scope.update = function() {
      // Submit request to Sails.
		$http.put('/ativo/' + $routeParams.id + '?name='+ $scope.ativo.name + '&serialNumber=' + $scope.ativo.serialNumber + '&assetNumber=' + $scope.ativo.assetNumber + '&model=' + $scope.ativo.model + '&size=' + $scope.ativo.size + '&price=' + $scope.ativo.price + '&description=' + $scope.ativo.description + '&type=' + $scope.ativo.type.id + '&owner=' + $scope.ativo.owner.id)
		.then(function onSuccess(sailsResponse){
			console.log($scope.ativo.user);
      window.location = '/#/asset';
		})
		.catch(function onError(sailsResponse){

		

		})
		.finally(function eitherWay(){
			$scope.timesheetForm.loading = false;
		})
  };

  $http.get("/ativo/" + $routeParams.id).then(function(results) {
    $scope.ativo = angular.fromJson(results.data);
  });

  $http.get("tipoativo").then(function(results) {
    $scope.tipos = angular.fromJson(results.data);
  });

  $http.get("user").then(function(results) {
    $scope.users = angular.fromJson(results.data);
  });
}]);
