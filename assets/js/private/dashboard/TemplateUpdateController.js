app.controller('TemplateUpdateController', ['$location', '$routeParams', '$scope', '$http', '$compile', function ($location, $routeParams, $scope, $http, $compile) {

    String.prototype.replaceAll = function (s, r) { return this.split(s).join(r) }

    $scope.init = function () {
        $scope.inputClass = "active";
        $http.get("/Template/" + $routeParams.id).then(function (results) {
            $scope.data = angular.fromJson(results.data);

            if ($scope.data.dataInicio != "" && $scope.data.dataInicio != undefined) {
                $scope.data.dataInicio = getDate($scope.data.dataInicio);
            }

            if ($scope.data.dataFim != "" && $scope.data.dataFim != undefined) {
                $scope.data.dataFim = getDate($scope.data.dataFim);
            }

            $scope.paginas = angular.fromJson(results.data.paginas);
            $scope.corpo = $scope.data.corpo;
            $('.modal-trigger').leanModal();
            $('.datepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY' });
            $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' });

        });
    };

    $scope.corpo = "";
    $scope.id = $routeParams.id;
    $scope.paginas = ([]);
    $scope.selectedPage = "";
    $scope.editPageId = 0;
    $scope.componenteNome = "";
    $scope.componenteTipo = "";
    $scope.componenteGrafico = "";
    $scope.componenteTabela = "";
    $scope.componenteValor = "";

    $scope.editarPagina = function (pagina, index) {
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

    function finalizePost (hasError, redirect) {
        if (hasError == true) {
            swal("Registro Alterado!", "Seu registro foi alterado, porém ocorreram erros ao alterar as páginas do relatório.", "success");
            Materialize.toast('Registro alterado, porém ocorreram erros ao alterar as páginas do relatório!', 4000);
        } else {
            swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
            Materialize.toast('Registro alterado com sucesso!', 4000);
        }

        if (redirect==true) {
            location.assign("#/Template");
        }
    };



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

			        var totalRequests = 0;
			        var totalResponses = 0;
			        var hasError = false;

			        angular.forEach($scope.paginas, function (value, key) {
			            totalRequests += 1;

			            $http({
			                method: 'PUT',
			                url: '/Pagina/' + value.id,
			                data: value
			            }).then(function onSuccess(sailsResponse) {
			                totalResponses += 1;
			                if (totalResponses == totalRequests) {
			                    finalizePost(hasError);
			                }

			            })
						.catch(function onError(sailsResponse) {
						    totalResponses += 1;
						    hasError = true;
						    if (totalResponses == totalRequests) {
						        finalizePost(hasError);
						    }
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
			    $scope.paginas.push(result.data);
			}, function (error) {
			    swal("Erro", "Erro ao incluir página", "error");

			});
    }


    $scope.addComponente = function (value) {

        if ($scope.componenteNome == "") {
            swal("Erro", "Para prosseguir é necessário que informe um label para " + ($scope.componenteTipo == 'tabela' ? 'a tabela' : 'o gráfico'), "error");
            $(".lean-overlay").hide();
            return;
        }

        if ($scope.componenteTipo == "?") {
            swal("Erro", "Para prosseguir é necessário que selecione o tipo do componente.", "error");
            $(".lean-overlay").hide();
            return;
        }

        if ($scope.componenteTipo == 'tabela') {
            if ($scope.componenteTabela == "") {
                swal("Erro", "Para prosseguir é necessário que selecione a tabela.", "error"); 
                $(".lean-overlay").hide();
                return;
            }
            $scope.selectedPage += "<tabela tipo='" + $scope.componenteTabela + "'  aterro='" + $scope.data.aterro.id + "'  inicio='" + getDate($scope.data.dataInicio) + "'  fim='" + getDate($scope.data.dataFim) + "'><p style='color: red;' >" + $scope.componenteNome + "</p></tabela><br />"
        } else {

            $scope.selectedPage += "<graficohorizontal  tipado='" + $scope.componenteValor + "' aterro='" + $scope.data.aterro.id + "'  inicio='" + getDate($scope.data.dataInicio) + "'  fim='" + getDate($scope.data.dataFim) + "'  ><p style='color: red;' >" + $scope.componenteNome + "</p></graficohorizontal><br />";
        }
        $(".lean-overlay").hide();
    };

    $scope.preparaConteudo = function (value) {

        var respostas = value.split('{{');
        function myFunction(item, index) {
            if (index != 0) {
                var tipo = item.split('}}')[0];
                if (tipo.indexOf('tabela(') !== -1) {
                    var parametro = tipo.split('&#39;')[1];


                    value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipo=\'' + parametro + '\' aterro=\'' + $scope.aterro + '\'   inicio=\'' + getDate($scope.data.dataInicio) + '\' fim=\'' + getDate($scope.data.dataFim) + '\' ></tabela>  ');
                }
                if (tipo.indexOf('grafico(') !== -1) {
                    var parametro = tipo.split('&#39;')[1];
                    var parametro2 = tipo.split('&#39;')[3];
                    if (parametro == 'marcohorizontal') {
                        value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro + '\'  inicio=\'' + getDate($scope.data.dataInicio) + '\' fim=\'' + getDate($scope.data.dataFim) + '\'  ></graficohorizontal>  ');
                    } else {
                        value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.aterro + '\'  inicio=\'' + getDate($scope.data.dataInicio) + '\' fim=\'' + getDate($scope.data.dataFim) + '\'  ></graficovertical>  ');
                    }
                }
            }
        }

        respostas.forEach(myFunction);
        return value;
    }
    $scope.verPagina = function () {
        $scope.paginas[$scope.editPageId].conteudo = $scope.selectedPage;
    };

    $scope.init();

    $scope.atualizarPaginasParametrizadasComDatas = function () {

        var totalRequests = 0;
        var totalResponses = 0;
        var hasError = false;

        $scope.paginasAux = $scope.data.paginas;

        for (var i = 0; i < $scope.paginasAux.length; i++) {
            var conteudo = $scope.paginasAux[i].conteudo;
            var indexOfInicio = conteudo.indexOf("inicio=");
            if (indexOfInicio < 0) continue;
            var indexOfFim = conteudo.indexOf("fim=");
            conteudo = conteudo.substr(0, indexOfInicio) + 'inicio="' + getDate($scope.data.dataInicio) + '" ' + conteudo.substr(indexOfInicio + 20);
            $scope.paginasAux[i].conteudo = conteudo.substr(0, indexOfFim) + 'fim="' + getDate($scope.data.dataFim) + '" ' + conteudo.substr(indexOfFim + 17);


            totalRequests += 1;

            $http({
                method: 'PUT',
                url: '/Pagina/' + $scope.paginasAux[i].id,
                data: $scope.paginasAux[i]
            }).then(function onSuccess(sailsResponse) {
                totalResponses += 1;
                if (totalResponses == totalRequests) {
                    finalizePost(hasError, true);
                }
            }).catch(function onError(sailsResponse) {
                totalResponses += 1;
                hasError = true;
                if (totalResponses == totalRequests) {
                    finalizePost(hasError, true);
                }
            })
            .finally(function eitherWay() {
                $scope.sennitForm.loading = false;
            })

        }
    }
    $scope.save = function () {
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

			        var params = $scope.data;

			        $(".datepicker").each(function (i, el) {
			            var value = $(this).val().split("/");
			            params[$(this).prop("name")] = new Date(value[2], parseInt(value[1]) - 1, value[0]);
			        });

			        $http({
			            method: 'PUT',
			            url: '/Template' + '/' + params.id,
			            data: params
			        }).then(function onSuccess(sailsResponse) {
			           
			            if ($scope.data.paginas == undefined || $scope.data.paginas.length == 0) {
			                finalizePost(hasError, true);
			            } else {
			                $scope.atualizarPaginasParametrizadasComDatas();
			            }

			            $scope.inputClass = null;
			            $scope.data = ([]);
			            $scope.inputClass = "disabled";
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