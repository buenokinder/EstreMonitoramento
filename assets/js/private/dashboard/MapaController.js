app.filter("asDate", function () {
    return function (input) {
      var d = new Date(input);
      d.setDate(d.getDate() + 1);
      return d;        
    }
});

app.controller('MapaController', ['$scope','$http','$sce', function($scope,$http, $sce){
    $scope.aterros = [];
    $scope.data = {};
    $scope.mapas = [];
    $scope.loadAterros = function() {
        return $http.get('/Aterro').success(function(data) {
            $scope.aterros = data;

   $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY', time: false });

                  $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    }
  );
        });
    };

   
     


    $scope.buscarMapas = function(id) {   
    	$scope.uploadData.id = id;
        return $http.get('/Mapa?where={"aterro": "' + id  + '"}').success(function(data) {
            $scope.mapas = data;
        });
    };
    $scope.addNewMapa = function(){
          $('#modal5').openModal();
    
    };
    $scope.aterroSelecionado = function() {
        if ($scope.aterro)
            return true;

        return false;
    };
$scope.selecionarAterro = function(aterro) {
        console.log(aterro);
         $scope.aterro =  aterro;
          $scope.buscarMapas(aterro.id);



          $scope.uploadData = aterro;
        return $http.get('/Mapa?where={"aterro": "' + aterro.id  + '"}&sort=dataCriacao DESC&limit=1').success(function(data) {
            if(data.length > 0)
                $scope.mapa = data[0];
                else
                $scope.mapa = null;

        });
    };
    
    $scope.selecionarMapa = function(mapa){
        $('.card-reveal').attr('style','transform: translateY(-0%)');
        $scope.mapa = mapa;
    }
    $scope.mapaLista = function(){
        $('.card-reveal').attr('style','display: block; transform: translateY(-100%)');
       
    }
    $scope.onComplete = function(response){
        Materialize.toast('Upload de Mapa efetuado com sucesso!', 4000)
        $('#modal5').closeModal();
         return $http.get('/Mapa?where={"aterro": "' + $scope.aterro.id  + '"}&sort=dataCriacao DESC&limit=1').success(function(data) {
            if(data.length > 0) {
              $scope.mapa = data[0];
              $scope.mapas.push(data[0]);
            }
            else
            $scope.mapa = null;

        });
    }

    
function isValidDate(s) {
  var bits = s.split('/');
  var d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && (d.getMonth() + 1) == bits[1];
} 
    $scope.medicaoTipo = { name: 'horizontal'} ;

    
    $scope.aterro = {};
    $scope.uploadData = {
        id:  'teasddda'
    };
    $scope.query = { data: ''};
    $scope.mapa = [];

    $scope.carregarMapa = function(){


    }

     $scope.open = function(){

                  
                    window.open('http://localhost:1337' + $scope.getSrc(), '_blank');
                  
                }

    $scope.getSrc = function() {

        if($("#datainicial").val() == "") return;
        var bits = $("#datainicial").val().split('/');
        var dataFinal  =  bits[2]+ '-' +bits[1]+ '-'+ bits[0];
        if($scope.mapa != null){
        var url = "/mapas?id=" + $scope.mapa.mapaFile + "&aterro=" + $scope.aterro.id + "&data="+  dataFinal +"&tipo=" + $scope.medicaoTipo.name;
        console.log(url);
        return $sce.trustAsResourceUrl(url);
        }
        return null;
    };

}]);
