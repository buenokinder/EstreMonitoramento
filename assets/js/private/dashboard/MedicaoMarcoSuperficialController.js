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
            var medicao = {'nome': colunas[0] , 'norte': colunas[1], 'leste': colunas[2] , 'cota': colunas[3]};
            var params = {'marcoSuperficial':$scope.data, 'nome': medicao.nome , 'norte': medicao.norte, 'leste': medicao.leste , 'cota': medicao.cota, 'aterro': $scope.usuario._aterro };
            $scope.medicoes.push(medicao);

            $http.post('/MedicaoMarcoSuperficialDetalhes', params).success(function(data, status){
   
            }).error(function(data, status){
                swal("Erro", "Ocorreu uma falha ao importar o arquivo :(", "error");
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
