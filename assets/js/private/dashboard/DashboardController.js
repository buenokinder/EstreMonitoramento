
app.filter("asDate", function () {
    return function (input) {
        var d = new Date(input);
        d.setDate(d.getDate() + 1);
        return d;
    }
});

app.controller('DashboardController', ['$scope', '$http', '$location', '$rootScope', '$interval', function ($scope, $http, $location, $rootScope, $interval) {
    $scope.pai = undefined;
    $scope.pathname = undefined;
    $scope.link = "";
    $scope.loading = false;
    $scope.aterros = ([]);
    
    var canvas = null;
    var ctx = null;
    var $fatorseguranca = null;
    var $canvas = null;

    $scope.data = {
        fatorSeguranca: 0,
        aterro: null,
        exibirMapaHorizontal: false,
        exibirMapaVertical: false,
        exibirLegenda: false,
        exibirFatorSeguranca: false,
        habilitado: false,
        imagemFatorSeguranca:''
    };
    $scope.monitoramentos = function () {
        document.location = '/MonitoramentoAterros';
    }
    $scope.preview = {
        mapaHorizontal: '',
        mapaVertical: '',

        setImageFatorSeguranca:function (img) {
            $("#preview").prop("src", img);
            $scope.data.imagemFatorSeguranca = img;
        }
    };
    
    $scope.save = function () {

        var params = {
            owner: $scope.data.aterro.id,
            exibirmapahorizontal: $scope.data.exibirMapaHorizontal,
            exibirmapavertical: $scope.data.exibirMapaVertical,
            exibirlegenda: $scope.data.exibirLegenda,
            fatorseguranca: $scope.data.fatorSeguranca,
            exibirfatorseguranca: $scope.data.exibirFatorSeguranca,
            habilitado: $scope.data.habilitado,
            imagemfatorseguranca: $scope.data.imagemFatorSeguranca
        };

        $http.get('/AterroDashBoard/?owner=' + params.owner).success(function (response, status) {
            var verbo = 'POST';
            var id = '';
            if (null != response && response.length != 0) {
                verbo = 'PUT';
                params.id = response[0].id;
                id = params.id;
            }

            $http({
                method: verbo,
                url: '/AterroDashBoard/' + id,
                data: params
            }).then(function onSuccess(sailsResponse) {
                swal("Configuração Inserida!", "Seu registro foi inserido com sucesso.", "success");
                Materialize.toast('Registro inserido com sucesso!', 4000);
            })
            .catch(function onError(sailsResponse) {
                swal("Erro!", "Ocorreu uma falha ao salvar a configuração :(", "error");
                Materialize.toast('Registro não inserido!', 4000);
            })
        }).error(function (err, status) {
            swal("Erro!", "Ocorreu uma falha ao salvar a configuração :(", "error");
            Materialize.toast('Registro não inserido!', 4000);
        });;
    };

    $scope.showMapas = function () {

        if ($scope.data.exibirMapaHorizontal && $scope.data.exibirMapaVertical) {
            $("#doismapas").show();
            $("#mapahorizontal").hide();
            $("#mapavertical").hide();
        }

        if ($scope.data.exibirMapaHorizontal && !$scope.data.exibirMapaVertical) {
            $("#doismapas").hide();
            $("#mapahorizontal").show();
            $("#mapavertical").hide();
        }


        if (!$scope.data.exibirMapaHorizontal && $scope.data.exibirMapaVertical) {
            $("#doismapas").hide();
            $("#mapahorizontal").hide();
            $("#mapavertical").show();
        }

        if (!$scope.data.exibirMapaHorizontal && !$scope.data.exibirMapaVertical) {
            $("#doismapas").hide();
            $("#mapahorizontal").hide();
            $("#mapavertical").hide();
        }
    }

    $scope.init = function () {
        $http.get('/aterro/dashboardConfig').success(function (aterros, status) {
            $scope.aterros = aterros;
        });

        $http.get('/setup').success(function (response, status) {
        });

        $scope.$watch("data.aterro", function () {
            $scope.refresh();
        });
        $scope.$watch("data.exibirMapaHorizontal", function () {
            $scope.showMapas();
        });

        $scope.$watch("data.exibirMapaVertical", function () {
            $scope.showMapas();
        });

        $scope.$watch("data.exibirLegenda", function () {
            
            if ($scope.data.exibirLegenda) {
                $("#legenda").show();
            } else {
                $("#legenda").hide();
            }
        });

        $scope.$watch("data.exibirFatorSeguranca", function () {
            if ($scope.data.exibirFatorSeguranca) {
                $("#fator").show();
            } else {
                $("#fator").hide();
            }
        });

        $('.dropify').dropify({
            messages: {
                default: 'Clique para selecionar uma imagem'
            }
        });
    };
    
    $scope.setMapas = function () {
        $(".mapv").each(function (i, o) {
            $(this).prop("src", $scope.preview.mapaVertical);
        });

        $(".maph").each(function (i, o) {
            $(this).prop("src", $scope.preview.mapaHorizontal);
        });
    };

    $scope.reset = function () {
        $scope.preview.mapaHorizontal = '';
        $scope.preview.mapaVertical = '';
        $scope.preview.setImageFatorSeguranca('');
        $scope.data.exibirMapaHorizontal = false;
        $scope.data.exibirMapaVertical = false;
        $scope.data.exibirLegenda = false;
        $scope.data.fatorSeguranca = false;
        $scope.data.exibirFatorSeguranca = false;
        $scope.data.habilitado = false;
    };

    $scope.refresh = function () {
        $scope.reset();
        $scope.setMapas();
        $scope.removeImage();

        var aterro = $scope.data.aterro;
        if (null == aterro) {
            return;
        }

        $scope.preview.setImageFatorSeguranca(aterro.imagemfatorseguranca);
        $scope.data.exibirMapaHorizontal = aterro.exibirmapahorizontal;
        $scope.data.exibirMapaVertical = aterro.exibirmapavertical;
        $scope.data.exibirLegenda = aterro.exibirlegenda;
        $scope.data.fatorSeguranca = aterro.fatorseguranca;
        $scope.data.exibirFatorSeguranca = aterro.exibirfatorseguranca;
        $scope.data.habilitado = aterro.habilitado;
        $("#sfatorseguranca").html(aterro.fatorseguranca);

        if (aterro.mapaFile != '') {
            var ticks = (new Date()).getTime();
            $scope.preview.mapaHorizontal = '/mapas?id=' + aterro.mapaFile + '&aterro=' + aterro.id + '&data=' + aterro.dataultimamedicao + '&tipo=horizontal' + '&ticks=' + ticks;
            $scope.preview.mapaVertical = '/mapas?id=' + aterro.mapaFile + '&aterro=' + aterro.id + '&data=' + aterro.dataultimamedicao + '&tipo=vertical' + '&ticks=' + ticks;
            $scope.setMapas();
        }

       // $scope.$apply();

    };

    $scope.removeImage = function () {
        $("#dropify-container").show();
        $(".preview").hide();
        $(".dropify").trigger($.Event("dropify.clear"), [this]);
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    $scope.showConfigFatorSeguranca = function () {

        $('#modalView').openModal();

        $("#sfatorseguranca").html($scope.data.fatorSeguranca);
        //$("#sfatorseguranca").css("width", $("#sfatorseguranca").textWidth($scope.data.fatorSeguranca));
        $("#sfatorseguranca").show();

        html2canvas($("#sfatorseguranca"), {
            onrendered: function (canvas) {

               // var width = $("#sfatorseguranca").css("width").replace("px", "");
               // var height = $("#sfatorseguranca").css("height").replace("px", "");
               // var extraCanvas = document.createElement("canvas");
               // extraCanvas.setAttribute('width', width);
               // extraCanvas.setAttribute('height', height);
               // var ctx = extraCanvas.getContext('2d');
               // ctx.fillRect(0, 0, width, height);
               // ctx.fillStyle = "rgba(0, 0, 200, 0)";
               // ctx.fill();
               // ctx.strokeStyle = 'rgba(255,255,255, 1)';
               // ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
               // var screenshot = extraCanvas.toDataURL();
               // $("#imgfatorseguranca").attr("src", screenshot);
                ////var screenshot = canvas.toDataURL("image/png");

                var screenshot = canvas.toDataURL();
                $("#imgfatorseguranca").attr("src", screenshot);
                $("#sfatorseguranca").hide();
                resetDrag();
            }
        });
    };

    $scope.$watch('$routeUpdate', function () {
        $scope.link = $location.path();
        $scope.alteraStatusBreadcrumbs($location.path());
    });

    $scope.perfil = window.SAILS_LOCALS._perfil;
    $scope.goto = function (path) {
        $location.path(path);
        $scope.alteraStatusBreadcrumbs(path);
    };

    function resetDrag() {
        $fatorseguranca = $("#imgfatorseguranca");
        $fatorseguranca.draggable({
            helper: 'clone',
            scroll: true
        });

        var imgFatorSeguranca = new Image();
        imgFatorSeguranca.src = $("#imgfatorseguranca").prop("src");
        $fatorseguranca.data("image", imgFatorSeguranca);
        $fatorseguranca.css("cursor", "move");
    }

    function dragDrop(e, ui) {
        var canvasOffset = $canvas.offset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;

        var element = ui.draggable;
        var data = element.data("url");
        var x = parseInt(ui.offset.left - offsetX);
        var y = parseInt(ui.offset.top - offsetY);  
        ctx.drawImage(element.data("image"), x - 1, y);

        $scope.preview.setImageFatorSeguranca(canvas.toDataURL());
        resetDrag();
    }



    $(".dropify").on('dropify.fileReady', function (e, ipreviewable, imgData, file) {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        $("#dropify-container").hide();
        $(".preview").show();

        var background = new Image();
        background.src = imgData;
        background.onload = function () {
            var maxWidth = canvas.width;
            var maxHeight = canvas.height;
            var ratio = 0;  
            var width = background.width;    
            var height = background.height;  

            if (width > maxWidth) {
                ratio = maxWidth / width;   // ratio scaling
                background.width =  maxWidth; 
                background.height = height * ratio;  
            }

            if (height > maxHeight) {
                ratio = maxHeight / height; // ratio scaling
                background.height = maxHeight;   
                background.width = width * ratio;
            }

            ctx.drawImage(background, 0, 0, background.width, background.height);
        };

        $scope.preview.setImageFatorSeguranca(imgData);

        $canvas = $("#canvas");
        $canvas.droppable({
            drop: dragDrop,
        });
    });

    $scope.alteraStatusBreadcrumbs = function (pathname) {
        switch (pathname) {
            case "/OperacaoSecaoCorte":
                $scope.pathname = "Seção de Corte";
                $scope.pai = "Área de Trabalho";
                break;
            case "/PluviometriaVazao":
                $scope.pathname = "Pluviometria e Vazão";
                $scope.pai = "Área de Trabalho";
                break;
            case "/Dashboard":
                $scope.pathname = "Dashboard";
                $scope.pai = undefined;
                break;
            case '/Alerta':
                $scope.pathname = "Alerta";
                $scope.pai = "Dados Mestre";
                break;
            case '/Aterro':
                $scope.pathname = "Aterro";
                $scope.pai = "Dados Mestre";
                break;
            case '/SecaoCorte':
                $scope.pathname = "Seção de Corte";
                $scope.pai = "Dados Mestre";
                break;
            case '/Template':
                $scope.pathname = "Template";
                $scope.pai = "Relatórios";
                break;
            case '/MarcoSuperficial':
                $scope.pathname = "Marco Superficial e Inclinômetro";
                $scope.pai = "Dados Mestre";
                break;
            case '/Piezometro':
                $scope.pathname = "Piezômetro";
                $scope.pai = "Dados Mestre";
                break;
            case '/MedicaoPiezometro':
                $scope.pathname = "Piezômetro";
                $scope.pai = "Área de Trabalho";
                break;
            case '/Usuario':
                $scope.pathname = "Usuário";
                $scope.pai = "Administração";
                break;
            default:
                $scope.pai = undefined;
                $scope.pathname = undefined;
        }
    };

    $scope.init();
}]);
