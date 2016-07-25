app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; 
});

app.config(['$routeProvider',  function ($routeProvider, $locationProvider) {
    $routeProvider.when('/home', {
      templateUrl: '/views/dashboard.html',
      controller : 'DashboardController'
    });

    $routeProvider.when('/SecaoCorte', {
        templateUrl: '/views/secaoCorte/index.html'
        // controller : 'LinhaCorteController'
    }).when('#/SecaoCorte/:id',{
        templateUrl: '/views/secaoCorte/index.html',
        controller : 'SecaoCorteController'
    });

  $routeProvider.when("/Template", {
		templateUrl: "/views/relatorios/template.html"
	}).when("/Template/new", {		
	  templateUrl: "/views/relatorios/newTemplate.html"
	}).when("/Template/:id", {		
	  templateUrl: "/views/relatorios/editTemplate.html",
	  controller: "TemplateUpdateController"
	}).when("/Template/visualizacao/:id", {		
	  templateUrl: "/views/relatorios/viewTemplate.html",
	  controller: "TemplateUpdateController"
	});
  
  $routeProvider.when("/Relatorio", {
		templateUrl: "/views/relatorios/relatorio.html"
	}).when("/Relatorio/:id", {		
	  templateUrl: "/views/relatorios/viewRelatorio.html",
	  controller: "ViewRelatorioController"
	});

  $routeProvider.when("/Alerta", {
			templateUrl: "/views/alerta/index.html"
		}).when("/Alerta/:id", {		
		  templateUrl: "/views/alerta/index.html"
		});

 
  $routeProvider.when("/Mapa", {
			templateUrl: "/views/mapa/index.html"
		}).when("/Mapa/:id", {		
		  templateUrl: "/views/mapa/index.html"
		});

		$routeProvider.when("/MedicaoMarcoSuperficial", {
			templateUrl: "/views/MedicaoMarcoSuperficial/index.html",
			 controller : 'MedicaoMarcoSuperficialController'
		});
 
  	$routeProvider.when("/PluviometriaVazao", {
			templateUrl: "/views/pluviometriaVazao/index.html",
			        controller : 'PluviometriaVazaoController'
		});

		$routeProvider.when("/OperacaoSecaoCorte", {
			templateUrl: "/views/operacaoSecaoCorte/index.html",
			   controller : 'OperacaoSecaoCorteController'
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
      redirectTo: '/home'
    });


  }]);
