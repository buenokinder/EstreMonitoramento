app.controller('OperacaoSecaoCorteController', ['$scope', '$http','$filter',   function($scope, $http, $filter){
  $scope.operacaoSecaoCortes = []; 
  $scope.usuario = window.SAILS_LOCALS;
  console.log('usuario', $scope.usuario);

  $http.get('/Usuario').success(function(data) {
      $scope.usuarios = angular.fromJson(data);
    });
    $http.get('/Aterro').success(function(data) {
      $scope.aterros = data;      
    });
  /*
  $scope.aterros = [];
  $scope.loadAterros = function() {
    return $scope.aterros.length ? null : $http.get('/Aterro').success(function(data) {
      $scope.aterros = data;
    });
  };*/

  $http.get('/SecaoCorte').success(function(data) {
      $scope.secaoCortes = data;
    });


   $scope.secaoCortes = ([]);
  $scope.init = function(){

    $http.get('/OperacaoSecaoCorte').success(function(data) {
      $scope.operacaoSecaoCortes = angular.fromJson(data);
      angular.forEach($scope.operacaoSecaoCortes, function(value, key) {
        if(value["secaoCorte"])
          value["secaoCorte"] = value["secaoCorte"].id;
        if(value["usuario"])
          value["usuario"] = value["usuario"].id;
        if(value["aterro"])
          value["aterro"] = value["aterro"].id;
      });      
    });
  };
  $scope.loadSecaoCorte = function() {
    return $scope.secaoCortes.length ? null : $http.get('/SecaoCorte').success(function(data) {
      $scope.secaoCortes = data;
      
    });
  };

  $scope.showSecaoCorte = function(data) {
    if(data.secaoCorte && $scope.secaoCortes.length) {
      var selected = $filter('filter')($scope.secaoCortes, {id: data.secaoCorte});
      return selected.length ? selected[0].nome : 'Not set';
    } else {
      return data.nome || 'Not set';
    }
  };

  $scope.showAterro = function(data) {
    var selected = [];
    if(data.aterro) {
      selected = $filter('filter')($scope.aterros, {id: data.aterro});
    }
    return selected.length ? selected[0].nome : 'Not set';
  };

  $scope.showUsuario = function(data) {
    var selected = [];
    if(data.usuario) {
      selected = $filter('filter')($scope.usuarios, {id: data.usuario});
    }
    return selected.length ? selected[0].name : 'Not set';
  };

  $scope.checkName = function(data, id) {
    if (id === 2 && data !== 'awesome') {
      return "Username 2 should be `awesome`";
    }
  };

  $scope.saveSecaoCorte = function(data, id) {
    if(id) {
      $scope.alterado = $filter('filter')($scope.operacaoSecaoCortes, {id: id})[0];
      angular.extend(data,{usuario: $scope.alterado.usuario}, {aterro: $scope.alterado.aterro}, {dataMedicao: $scope.alterado.dataMedicao});     
      return $http({
          method: 'PUT',
          url: '/OperacaoSecaoCorte/' + id,
          data: data
      }).then(function onSuccess(sailsResponse){
          swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
          Materialize.toast('Registro alterado com sucesso!', 4000);
          return true;
      });          
    } 
    else {
      angular.extend(data, {dataMedicao: new Date()}, {usuario: $scope.usuario._id}, {aterro: $scope.usuario._aterro});
      return $http.post('/OperacaoSecaoCorte', data);
    }
  };

$scope.dataAtualFormatada = function(data){
    
    var dia = data.getDate();
    if (dia.toString().length == 1)
      dia = "0"+dia;
    var mes = data.getMonth()+1;
    if (mes.toString().length == 1)
      mes = "0"+mes;
    var ano = data.getFullYear();  
    return dia+"/"+mes+"/"+ano;
}
  $scope.removeSecaoCorte = function(id,index) {
    swal({   title: "Você tem certeza que deseja excluir?",   
        text: "Não será mais possivel recuperar esse Registro!",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Sim",   
        cancelButtonText: "Cancelar",   
        closeOnConfirm: false,   
        closeOnCancel: false }, 
        function(isConfirm){   
            if (isConfirm) {     
                swal("Deletado!", "Seu registro foi excluido.", "success");
                $http.delete('/OperacaoSecaoCorte/' + id )
                .then(function (project) {                    
                    $scope.operacaoSecaoCortes.splice(index, 1);                    
                });
            } else {
                swal("Cancelado", "Seu registro está seguro :)", "error");   
            } 
        }
    );
    
  };

  $scope.addSecaoCorte = function() {
    $scope.inserted = {
      dataMedicao: new Date(),
      aterro : $scope.usuario._aterro,
      usuario : $scope.usuario._id,
      tipoEstaca: null,
      altura: null ,
      comprimento: null
    };
    $scope.operacaoSecaoCortes.push($scope.inserted);    
  };

}]);
