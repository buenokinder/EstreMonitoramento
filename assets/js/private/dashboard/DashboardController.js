
app.filter("asDate", function () {
    return function (input) {
      var d = new Date(input);
      d.setDate(d.getDate() + 1);
      return d;        
    }
});

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
      case "/OperacaoSecaoCorte":
        $scope.pathname = "Seção de Corte";
        $scope.pai = "Área de Trabalho";
        break; 
      case "/PluviometriaVazao":
        $scope.pathname = "Pluviometria e Vazão";
        $scope.pai = "Área de Trabalho";
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
      case '/SecaoCorte' :
        $scope.pathname = "Seção de Corte";
        $scope.pai = "Dados Mestre";
        break;
      case '/Template' :
        $scope.pathname = "Template";
        $scope.pai = "Relatórios";
        break;        
      case '/MarcoSuperficial' :
        $scope.pathname = "Marco Superficial e Inclinômetro";
        $scope.pai = "Dados Mestre";
        break;  
      case '/Piezometro' :
        $scope.pathname = "Piezômetro";
        $scope.pai = "Dados Mestre";
        break;
      case '/Usuario' :
        $scope.pathname = "Usuário";
        $scope.pai = "Administração";
        break;
      default:
        $scope.pai = undefined;
        $scope.pathname = undefined;        
    }    
  };  
}]);
