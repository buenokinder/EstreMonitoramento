app.controller('TemplateUpdateController', ['$location', '$routeParams', '$scope', '$http', '$compile', function($location, $routeParams, $scope, $http, $compile){
	
	$scope.init = function() {
		$scope.inputClass = "active";
    $http.get("/Template/"+ $routeParams.id).then(function (results) {                                
      $scope.data  = angular.fromJson (results.data);
	     $scope.corpo = $scope.data.corpo;                        
    });
	};
$scope.corpo = "";
    String.prototype.replaceAll = function (s, r) { return this.split(s).join(r) }
	$scope.verPagina = function(){
		$scope.corpo = $scope.data.corpo;
		var respostas = $scope.corpo.split('{{');
           function myFunction(item, index) {
                if (index != 0) {
                    var tipo = item.split('}}')[0];
                    if (tipo.indexOf('tabela(') !== -1) {
                        var parametro = tipo.split('&#39;')[1];


                        $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipo=\'' + parametro + '\' aterro=\'' + $scope.aterro  + '\'   inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\' ></tabela>  ');
                    }
                    if (tipo.indexOf('grafico(') !== -1) {
                        var parametro = tipo.split('&#39;')[1];


                        var parametro2 = tipo.split('&#39;')[3];
                     
                        if (parametro == 'marcohorizontal') {
                            $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro  + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficohorizontal>  ');
                        } else {
                            $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro  + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficovertical>  ');
                        }

                    }
                }
            }


            respostas.forEach(myFunction);

    };

	// $scope.getData() = function(){
	// 	 function myFunction(item, index) {
    //             if (index != 0) {
    //                 var tipo = item.split('}}')[0];
    //                 if (tipo.indexOf('tabela(') !== -1) {
    //                     var parametro = tipo.split('&#39;')[1];


    //                     $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipo=\'' + parametro + '\' aterro=\'' + $scope.aterro  + '\'   inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\' ></tabela>  ');
    //                 }
    //                 if (tipo.indexOf('grafico(') !== -1) {
    //                     var parametro = tipo.split('&#39;')[1];


    //                     var parametro2 = tipo.split('&#39;')[3];
    //                     console.log(parametro);
    //                     if (parametro == 'marcohorizontal') {
    //                         $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro  + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficohorizontal>  ');
    //                     } else {
    //                         $scope.corpo = $scope.corpo.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro  + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficovertical>  ');
    //                     }

    //                 }
    //             }
    //         }
    //         respostas.forEach(myFunction);
	// }
	$scope.init();
$scope.save = function() {
	console.log('data editado' ,$scope.data)
	
	// $scope.sennitForm.loading = true;
	swal({   title: "",   
	    text: "Você tem certeza que deseja alterar este registro?",   
	    type: "warning",   
	    showCancelButton: true, 
	    confirmButtonText: "Sim",   
	    cancelButtonText: "Cancelar",   
	    closeOnConfirm: false,   
	    closeOnCancel: false }, 
	    function(isConfirm){   
	        if (isConfirm) {     
	            
	            $http({
	                method: 'PUT',
	                url: '/Template' + '/' + $scope.data.id,
	                data: $scope.data
	            }).then(function onSuccess(sailsResponse){
	                $scope.inputClass = null;
	                //sennitCommunicationService.prepForBroadcastDataList($scope.data);
	                $scope.data = ([]);
	                $scope.inputClass = "disabled";
	                swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
	                Materialize.toast('Registro alterado com sucesso!', 4000);
	                location.assign("#/Template");
	            })
	            .catch(function onError(sailsResponse){

	            })
	            .finally(function eitherWay(){
	                // $scope.sennitForm.loading = false;
	            })	            
	        } else {
	            swal("Cancelado", "Seu registro não foi alterado :(", "error");
	        } 
	    }
	);  
};
	                
}]);