app.controller('TemplateUpdateController', ['$location', '$routeParams', '$scope', '$http', function($location, $routeParams, $scope, $http){
	
	$scope.init = function() {
		$scope.inputClass = "active";
    $http.get("/Template/"+ $routeParams.id).then(function (results) {                                
      $scope.data  = results.data;                           
    });
	};
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