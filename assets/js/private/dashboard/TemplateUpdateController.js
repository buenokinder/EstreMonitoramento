app.controller('TemplateUpdateController', ['$location', '$routeParams', '$scope', '$http', '$compile', function ($location, $routeParams, $scope, $http, $compile) {

	$scope.init = function () {
		$scope.inputClass = "active";
		$http.get("/Template/" + $routeParams.id).then(function (results) {
			$scope.data = angular.fromJson(results.data);
			$scope.paginas = angular.fromJson(results.data.paginas);
			$scope.corpo = $scope.data.corpo;
			$('.modal-trigger').leanModal();
		});
	};


	$scope.corpo = "";
	$scope.id = $routeParams.id;
	$scope.paginas = ([]);
	$scope.selectedPage = "";
	$scope.editPageId = 0;


	$scope.editarPagina = function (pagina, index) {
		console.log(index);
		$scope.editPageId = index;

		$scope.selectedPage = pagina.conteudo;
		if (!$scope.$$phase) {
			$scope.$apply();
		}

	};
	$scope.deletePagina = function (pagina) {
		swal({
			title: "Você tem certeza que deseja excluir?",
			text: "Não será mais possivel recuperar esse Registro!",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Sim",
			cancelButtonText: "Cancelar",
			closeOnConfirm: false,
			closeOnCancel: false
		},
			function (isConfirm) {
				if (isConfirm) {
					swal("Deletado!", "Seu registro foi excluido.", "success");
					$http.delete('/Pagina/' + pagina.id)
						.then(function (project) {
							var index = $scope.paginas.indexOf(pagina);
							$scope.paginas.splice(index, 1);

						});
				} else {
					swal("Cancelado", "Seu registro está seguro :)", "error");
				}
			}
		);
	}
	$scope.savePage = function () {
		swal({
			title: "",
			text: "Você tem certeza que deseja alterar este registro?",
			type: "warning",
			showCancelButton: true,
			confirmButtonText: "Sim",
			cancelButtonText: "Cancelar",
			closeOnConfirm: false,
			closeOnCancel: false
		},
			function (isConfirm) {
				if (isConfirm) {

					angular.forEach($scope.paginas, function (value, key) {
						$http({
							method: 'PUT',
							url: '/Pagina/' + value.id,
							data: value
						}).then(function onSuccess(sailsResponse) {

							swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
							Materialize.toast('Registro alterado com sucesso!', 4000);

						})
							.catch(function onError(sailsResponse) {

							})
							.finally(function eitherWay() {
								$scope.sennitForm.loading = false;
							})

					});

				} else {
					swal("Cancelado", "Seu registro não foi alterado :(", "error");
				}
			}
		);


	}
	$scope.novaPagina = function () {
		var model = {
			conteudo: '',
			pagina: 0,
			nome: 'Nova Pagina',
			template: $routeParams.id

		}
		if ($scope.paginas.length > 0) {
			model =
				{
					conteudo: '',
					pagina: $scope.paginas.length + 1,
					nome: 'Nova Pagina',
					template: $routeParams.id

				};

		}
		$http.post('/Pagina', model).then(
			function (result) {
				console.log('retorno');
				console.log(result);
				$scope.paginas.push(result.data);
			}, function (error) {
				swal("Erro", "Erro ao incluir página", "error");

			});


		console.log($scope.paginas);

	}




    String.prototype.replaceAll = function (s, r) { return this.split(s).join(r) }

	$scope.componenteNome = "";
	$scope.componenteTipo = "";
	$scope.componenteGrafico = "";
	$scope.componenteTabela = "";
	$scope.componenteValor = "";

	$scope.addComponente = function (value) {
		console.log('teste');

		console.log($scope.componenteTipo);
		if ($scope.componenteTipo == 'tabela') {
			console.log($scope.componenteTipo);
			$scope.selectedPage += "<tabela tipo='" + $scope.componenteTabela + "'  aterro='" + $scope.data.aterro.id + "'  inicio='" + $scope.data.dataInicial + "'  fim='" + $scope.data.dataFim + "'><p style='color: red;' >" + $scope.componenteNome + "</p></tabela>"
		} else {
			$scope.selectedPage += "<graficohorizontal  tipado='" + $scope.componenteValor + "' aterro='" + $scope.data.aterro.id + "'  inicio='" + $scope.data.dataInicial + "'  fim='" + $scope.data.dataFim + "'  ><p style='color: red;' >" + $scope.componenteNome + "</p></graficohorizontal>";

		}
		console.log($scope.selectedPage);
		$(".lean-overlay").hide();
	}
	$scope.preparaConteudo = function (value) {

		var respostas = value.split('{{');
		function myFunction(item, index) {
			if (index != 0) {
				var tipo = item.split('}}')[0];
				if (tipo.indexOf('tabela(') !== -1) {
					var parametro = tipo.split('&#39;')[1];


					value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipo=\'' + parametro + '\' aterro=\'' + $scope.aterro + '\'   inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\' ></tabela>  ');
				}
				if (tipo.indexOf('grafico(') !== -1) {
					console.log('entrou 1');
					var parametro = tipo.split('&#39;')[1];


					var parametro2 = tipo.split('&#39;')[3];
					console.log('entrou 2');
					if (parametro == 'marcohorizontal') {
						console.log('entrou 3');
						value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficohorizontal>  ');
					} else {
						console.log('entrou 4');
						value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro + '\'  inicio=\'' + $scope.data.dataInicial + '\' fim=\'' + $scope.data.dataFim + '\'  ></graficovertical>  ');
					}

				}
			}
		}


		respostas.forEach(myFunction);
		console.log(value);
		return value;
	}
	$scope.verPagina = function () {
		console.log('teste');
		console.log($scope.selectedPage);


		$scope.paginas[$scope.editPageId].conteudo = $scope.selectedPage;
		console.log($scope.paginas);

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
	$scope.save = function () {
		console.log('data editado', $scope.data)

		// $scope.sennitForm.loading = true;
		swal({
			title: "",
			text: "Você tem certeza que deseja alterar este registro?",
			type: "warning",
			showCancelButton: true,
			confirmButtonText: "Sim",
			cancelButtonText: "Cancelar",
			closeOnConfirm: false,
			closeOnCancel: false
		},
			function (isConfirm) {
				if (isConfirm) {

					$http({
						method: 'PUT',
						url: '/Template' + '/' + $scope.data.id,
						data: $scope.data
					}).then(function onSuccess(sailsResponse) {
						$scope.inputClass = null;
						//sennitCommunicationService.prepForBroadcastDataList($scope.data);
						$scope.data = ([]);
						$scope.inputClass = "disabled";
						swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
						Materialize.toast('Registro alterado com sucesso!', 4000);
						location.assign("#/Template");
					})
						.catch(function onError(sailsResponse) {

						})
						.finally(function eitherWay() {
							// $scope.sennitForm.loading = false;
						})
				} else {
					swal("Cancelado", "Seu registro não foi alterado :(", "error");
				}
			}
		);
	};

}]);