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


		$routeProvider.when("/PocosVisita", {
			templateUrl: "/views/pocosvisita/index.html"
		}).when("/PocosVisita/:id", {		
		  templateUrl: "/views/pocosvisita/index.html"
		});
 
 		$routeProvider.when("/FatorSeguranca", {
			templateUrl: "/views/fatorseguranca/index.html"
		}).when("/FatorSeguranca/:id", {		
		  templateUrl: "/views/fatorseguranca/index.html"
		});
 

 		$routeProvider.when("/Bombeamento", {
			templateUrl: "/views/bombeamento/index.html"
		}).when("/Bombeamento/:id", {		
		  templateUrl: "/views/bombeamento/index.html"
		});
 

  		$routeProvider.when("/Mapa", {
			templateUrl: "/views/mapa/index.html"
		}).when("/Mapa/:id", {		
		  templateUrl: "/views/mapa/index.html"
		});

		$routeProvider.when("/MedicaoMarcoSuperficial", {
			templateUrl: "/views/medicaomarcosuperficial/index.html",
			 controller : 'MedicaoMarcoSuperficialController'
		});
 

		$routeProvider.when("/MedicaoPiezometro", {
			templateUrl: "/views/medicaopiezometro/index.html",
			 controller : 'MedicaoPiezometroController'
		});
 

 
	 	$routeProvider.when('/MonitoramentoMarcoSuperficial', {
		    templateUrl: '/views/medicaomarcosuperficial/monitoramento.html',
		    controller : 'MedicaoMarcoSuperficialController'
		});

	 	$routeProvider.when('/MonitoramentoPiezometro', {
		    templateUrl: '/views/piezometro/monitoramento.html',
		    controller : 'MedicaoPiezometroController'
		});



  		$routeProvider.when("/PluviometriaVazao", {
			templateUrl: "/views/pluviometriavazao/index.html",
			        controller : 'PluviometriaVazaoController'
		});

		$routeProvider.when("/OperacaoSecaoCorte", {
			templateUrl: "/views/operacaosecaocorte/index.html",
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

		$routeProvider.when("/PocosVisita", {
			templateUrl: "/views/pocosvisita/index.html"
		}).when("/PocosVisita/:id", {		
		  templateUrl: "/views/pocosvisita/index.html"
		});

		$routeProvider.when("/Bombeamento", {
			templateUrl: "/views/bombeamento/index.html"
		}).when("/Bombeamento/:id", {		
		  templateUrl: "/views/bombeamento/index.html"
		});

		$routeProvider.when("/SecaoFatorSeguranca", {
			templateUrl: "/views/secaofatorseguranca/index.html"
		}).when("/SecaoFatorSeguranca/:id", {		
		  templateUrl: "/views/secaofatorseguranca/index.html"
		});

	  	$routeProvider.when("/Piezometro", {
			templateUrl: "/views/piezometro/index.html",
			controller : 'PiezometroController'			
		}).when("/Piezometro/:id", {		
		  templateUrl: "/views/piezometro/index.html",
		  controller : 'PiezometroController'
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
