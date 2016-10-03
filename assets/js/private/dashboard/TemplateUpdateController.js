app.controller('TemplateUpdateController', ['$location', '$routeParams', '$scope', '$http', '$compile', function ($location, $routeParams, $scope, $http, $compile) {

    String.prototype.replaceAll = function (s, r) { return this.split(s).join(r) }

    $scope.init = function () {
        $scope.inputClass = "active";


        $http.get("/Template/" + $routeParams.id).then(function (results) {

            $scope.data = angular.fromJson(results.data);
            $scope.loadAterros();

            if ($scope.data.dataInicio != "" && $scope.data.dataInicio != undefined) {
                $scope.data.dataInicio = getDate($scope.data.dataInicio);
            }

            if ($scope.data.dataFim != "" && $scope.data.dataFim != undefined) {
                $scope.data.dataFim = getDate($scope.data.dataFim);
            }

            $scope.paginas = angular.fromJson(results.data.paginas);
            $scope.corpo = $scope.data.corpo;

            $('.modal-trigger').leanModal({
                dismissible: false,
                opacity: .5,
                in_duration: 300,
                out_duration: 200,
                starting_top: '4%',
                ending_top: '10%',
            });

            $('.datepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY' });
            $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' });
        });
    };

    $scope.loadAterros = function () {
        $http.get('/Aterro/Search').success(function (data) {
            $scope.aterros = angular.fromJson(data);
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
    $scope.aterros = ([]);

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

    function finalizePost(hasError, redirect) {
        if (hasError == true) {
            swal("Registro Alterado!", "Seu registro foi alterado, porém ocorreram erros ao alterar as páginas do relatório.", "success");
            Materialize.toast('Registro alterado, porém ocorreram erros ao alterar as páginas do relatório!', 4000);
        } else {
            swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
            Materialize.toast('Registro alterado com sucesso!', 4000);
        }

        if (redirect == true) {
            location.assign("#/Template");
        }
    };

    $scope.closeBoxComponent = function () {
        $('#modalView').closeModal();
        $(".lean-overlay").hide();
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
                    var parametro2 = tipo.split('&#39;')[3];

                    value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<tabela tipado=\'' + parametro2 + '\'  tipo=\'' + parametro + '\' aterro=\'' + $scope.data.aterro.id + '\'   inicio=\'' + getDate($scope.data.dataInicio) + '\' fim=\'' + getDate($scope.data.dataFim) + '\' ></tabela>  ');
                }
                if (tipo.indexOf('grafico(') !== -1) {
                    var parametro = tipo.split('&#39;')[1];
                    var parametro2 = tipo.split('&#39;')[3];
                    if (parametro == 'marcohorizontal') {
                        value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficohorizontal  tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.data.aterro.id + '\'  inicio=\'' + getDate($scope.data.dataInicio) + '\' fim=\'' + getDate($scope.data.dataFim) + '\'  ></graficohorizontal>  ');
                    } else {
                        value = value.replaceAll('{{' + item.split('}}')[0] + '}}', '<graficovertical tipado=\'' + parametro2 + '\'  aterro=\'' + $scope.data.aterro.id + '\'  inicio=\'' + getDate($scope.data.dataInicio) + '\' fim=\'' + getDate($scope.data.dataFim) + '\'  ></graficovertical>  ');
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


    function getObjMatrix(obj) {
        var matrix = obj.css("-webkit-transform") ||
            obj.css("-moz-transform") ||
            obj.css("-ms-transform") ||
            obj.css("-o-transform") ||
            obj.css("transform");
        return matrix;
    }
    //  function setDPI(canvas, dpi) {
    //if (!canvas.style.width)
    //    canvas.style.width = canvas.width + 'px';
    //if (!canvas.style.height)
    //    canvas.style.height = canvas.height + 'px';

    //var scaleFactor = dpi / 96;
    //canvas.width = Math.ceil(canvas.width * scaleFactor);
    //canvas.height = Math.ceil(canvas.height * scaleFactor);
    //var ctx = canvas.getContext('2d');
    //ctx.scale(scaleFactor, scaleFactor);
    // }


    $scope.imprimir_printscreen = function () {
        $("#relatorio").prop('class', 'col s7 l7 m7');
        $("#editor").hide();
        $("#relatorio-conteudo").css('height', '100%');
        $(".hideonprint").hide();

        var svgs = $("svg");
        var A4 = { width: 595, height: 842 };
        var scaleFactor = 72 / 96;

        $.each(svgs, function (i, svg) {

            var canvas = document.createElement('canvas');
            canvas.width = $(svg).width();
            canvas.height = $(svg).height();

            var ctx = canvas.getContext('2d');
            var img = document.createElement('img');
            var base64 = btoa(unescape(encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + $(svg).width() + '" height="' + $(svg).height() + '">' + $(svg).html() + '</svg>')));

            img.setAttribute('src', 'data:image/svg+xml;base64,' + base64);

            var loadImg = function (canvas, svg, ctx, img) {
                img.onload = function () {

                    var parent = svg.parent();

                    if (!canvas.style.width)
                        canvas.style.width = canvas.width + 'px';
                    if (!canvas.style.height)
                        canvas.style.height = canvas.height + 'px';

                    ctx.translate(canvas.width / 2, canvas.height / 2);

                    // roate the canvas by +90% 
                    ctx.rotate(Math.PI / 2);

                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;

                    // since images draw from top-left offset the draw by 1/2 width & height
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);


                    parent.html("<img src='" + canvas.toDataURL('image/png') + "' />");
                    // un-rotate -90% (== -Math.PI/2)
                    ctx.rotate(-Math.PI / 2);

                    // un-translate - origin==top-left canvas
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);

                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // ctx.scale(scaleFactor, scaleFactor);
                    //window.open(canvas.toDataURL('image/png'), "to", "width=1024,height=768");
                };
            }
            loadImg(canvas, $(svg), ctx, img);
        });

        html2canvas($("#relatorio"), {
            onrendered: function (canvas) {

                $("#relatorio").prop('class', 'col s6 l6 m6');
                $("#relatorio-conteudo").css('height', '850px');
                $("#editor").show();
                $(".hideonprint").show();

                var dataUrl = canvas.toDataURL();

                $("body").css({
                    'transform': 'scale(1)',
                    '-ms-transform': 'scale(1)',
                    '-webkit-transform': 'scale(1)'
                });

                var el = "<div style='width:100%;height:100%'><img style='width:100%;height:100%' src='" + dataUrl + "'/></div>"
                $("body").html(el);
                window.print();
                location.reload();
            }
        });
    };


    $scope.imprimir = function () {
        $("#relatorio").prop('class', 'col s7 l7 m7');
        $("#editor").hide();
        $("#relatorio-conteudo").css('height', '100%');
        $(".hideonprint").hide();

        $(".grafico-rotate").each(function (i, rotate) {
            $(rotate).prop("style", "width: 100%;-webkit-transform: position: relative;top: 150px;");
        });

        $(".highcharts-container").each(function (i, rotate) {
            $(rotate).css("height", "916px");
        });

        $(".horizontal").each(function (i, rotate) {
            $(rotate).css("height", "916px");
        });

        var svgs = $("svg");
        var A4 = { width: 595, height: 842 };
        var totalRequests = 0;
        var totalResponses = 0;

        $.each(svgs, function (i, svg) {

            var canvas = document.createElement('canvas');
            canvas.width = $(svg).width();
            canvas.height = $(svg).height();

            var ctx = canvas.getContext('2d');
            var img = document.createElement('img');
            var base64 = btoa(unescape(encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + $(svg).width() + '" height="' + $(svg).height() + '">' + $(svg).html() + '</svg>')));

            img.setAttribute('src', 'data:image/svg+xml;base64,' + base64);

            var loadImg = function (canvas, svg, ctx, img) {
                img.onload = function () {

                    var parent = svg.parent();

                    if (!canvas.style.width)
                        canvas.style.width = canvas.width + 'px';
                    if (!canvas.style.height)
                        canvas.style.height = canvas.height + 'px';


                    ctx.translate(canvas.width / 2, canvas.height / 2);

                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.imageSmoothingEnabled = false;
                    //ctx.drawImage(img, 0, 0);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);

                    var rotateImage = function (canvas, parent) {
                        totalRequests += 1;
                        $.ajax({
                            url: 'http://geotecnia.estre.com.br:81/getimage.ashx',
                            type: "POST",
                            beforeSend: function (jqXHR, settings) {
                                return true;
                            },
                            data: { content: canvas.toDataURL('image/png') },
                            contentType: "application/x-www-form-urlencoded; charset=utf-8",
                            success: function (result) {
                                totalResponses += 1;
                                var src = 'data:image/png;base64,' + result.image;
                                parent.html("<img src='" + src + "' />");
                            }
                        });

                    };

                    rotateImage(canvas, parent);
                };
            }
            loadImg(canvas, $(svg), ctx, img);
        });


        var itv = setInterval(function () {

            if (totalResponses == totalRequests) {
                clearInterval(itv);

                var totalPages = $("page[size='A4']").length;
                var index = 0;

                $.each($("page[size='A4']"),
					function (i, o) {
					    index += 1;
					    if (index != totalPages) {
					        $(o).css("height", "33cm");
					    }
					}
				);

                html2canvas($("#relatorio"), {
                    onrendered: function (canvas) {

                        $("#relatorio").prop('class', 'col s6 l6 m6');
                        $("#relatorio-conteudo").css('height', '850px');
                        $("#editor").show();
                        $(".hideonprint").show();


                        var dataUrl = canvas.toDataURL();

                        // $("body").css({
                        // 'transform': 'scale(0)',
                        // '-ms-transform': 'scale(0)',
                        // '-webkit-transform': 'scale(0)'
                        // });

                        var el = "<div style='width:100%;height:100%'><img style='width:100%;height:100%' src='" + dataUrl + "'/></div>"
                        $("body").html(el);
                        window.print();
                        location.reload();
                    }
                });
            }
        }, 500);

    };


    $scope.init();

    $scope.atualizarPaginasParametrizadasComDatas = function () {

        var totalRequests = 0;
        var totalResponses = 0;
        var hasError = false;

        var paginasAux = $scope.data.paginas;

        for (var i = 0; i < $scope.data.paginas.length; i++) {

            var conteudo = paginasAux[i].conteudo;


            var conteudo = paginasAux[i].conteudo;
            var indexAterro = conteudo.indexOf("aterro=");
            var lengthOfIdAndSpaceAndDoubleQuotes = 34;
            if (indexAterro >= 0) {
                conteudo = conteudo.substr(0, indexAterro) + 'aterro="' + $scope.data.aterro.id + '" ' + conteudo.substr(indexAterro + lengthOfIdAndSpaceAndDoubleQuotes);
            }

            var indexOfInicio = conteudo.indexOf("inicio=");
            if (indexOfInicio >= 0) {
                var indexOfFim = conteudo.indexOf("fim=");
                var lengthOfStringStartDateAndSpaceAndDoubleQuotes = 20;
                var lengthOfStringEndDateAndSpaceAndDoubleQuotes = 17;

                conteudo = conteudo.substr(0, indexOfInicio) + 'inicio="' + getDate($scope.data.dataInicio) + '" ' + conteudo.substr(indexOfInicio + lengthOfStringStartDateAndSpaceAndDoubleQuotes);
                conteudo = conteudo.substr(0, indexOfFim) + 'fim="' + getDate($scope.data.dataFim) + '" ' + conteudo.substr(indexOfFim + lengthOfStringEndDateAndSpaceAndDoubleQuotes);
            }

            if (indexAterro < 0 && indexAterro < 0) continue;

            paginasAux[i].conteudo = conteudo;

            totalRequests += 1;

            $http({
                method: 'PUT',
                url: '/Pagina/' + paginasAux[i].id,
                data: paginasAux[i]
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
            text: "Você tem certeza que deseja alterar este registro ?",
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