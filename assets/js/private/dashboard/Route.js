

app.config(['$routeProvider',  function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
      templateUrl: '/views/dashboard.html',
      controller : 'DashboardController'
    });

    $routeProvider.when('/LinhaCorte', {
        templateUrl: '/views/linhaCorte/index.html',
        controller : 'LinhaCorteController'
    }).when('#/LinhaCorte/:id',{
        templateUrl: '/views/linhaCorte/index.html',
        controller : 'LinhaCorteController'
    });

    
 
  $routeProvider.when("/Alerta", {
			templateUrl: "/views/alerta/index.html"
		}).when("/Alerta/:id", {		
		  templateUrl: "/views/alerta/index.html"
		});

     
  $routeProvider.when("/Aterro", {
			templateUrl: "/views/aterro/index.html"
		}).when("/Alerta/:id", {		
		  templateUrl: "/views/aterro/index.html"
		});

	  $routeProvider.when("/MarcoSuperficial", {
			templateUrl: "/views/marcosuperficial/index.html"
		}).when("/MarcoSuperficial/:id", {		
		  templateUrl: "/views/marcosuperficial/index.html"
		});

	  $routeProvider.when("/Piezometro", {
			templateUrl: "/views/piezometro/index.html"
		}).when("/Piezometro/:id", {		
		  templateUrl: "/views/piezometro/index.html"
		});

        
	  $routeProvider.when("/Usuario", {
			templateUrl: "/views/usuario/index.html"
		}).when("/Usuario/:id", {		
		  templateUrl: "/views/usuario/index.html"
		});
    
    
    $routeProvider.otherwise({
      redirectTo: '/'
    });


  }]);
