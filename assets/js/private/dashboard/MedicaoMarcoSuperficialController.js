

app.controller('MedicaoMarcoSuperficialController', ['$scope', '$http', 'sennitCommunicationService',   function($scope, $http, sennitCommunicationService){
    $scope.data = [];
    $scope.medicoes = [];
    $scope.verMedicoes = false;
      $scope.usuario = window.SAILS_LOCALS;
      
      $scope.showContent = function($fileContent){

        var linhas = $fileContent.split('\n');
        for(var i = 0;i < linhas.length;i++){
            var linha = linhas[i];
            var colunas = linha.split(';');


            $http.post('/MedicaoMarcoSuperficialDetalhes', { 'nome': colunas[0] , 'norte': colunas[1], 'leste': colunas[2] , 'cota': colunas[3], aterro: '577fa8ef71a649a105219ef9' }).success(function(data, status){
        console.log(data);
    
    })
    .error(function(data, status){
        console.log("Fail... :-(");
    });;
            
        }
        $scope.content = $fileContent;
    };

     $scope.$on('handleBroadcast', function() {
                    $scope.data = sennitCommunicationService.data;
                    $scope.inputClass = "active";
                    $scope.verMedicoes = true;
    }); 

     $scope.uploadDetalhes = function(){
         $('.dropify').dropify({
                messages: {
                    default: 'Arraste seu Arquivo',
                    
                }
            });
          $('#modalUpload').openModal();
    
    };

    $scope.addNewMapa = function(){
          $('#modalMedicaoUpload').openModal();
    
    };
   
}]);
