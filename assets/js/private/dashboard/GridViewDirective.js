app.directive('gridView', ['$compile', 'sennitCommunicationService', function ($compile, sennitCommunicationService) {
    return {
        restrict: 'E',
        scope: {
            filters: '=',
            fields: '=',
            listaname: '@',
            noacess: '=',
            adicionar: '@',
            view: '@',
            strupdate: '@',
            calculate: '@',
            calculatetitle: '@',
            update: '@',
            strdelete: '@',
            pagesize: '=',
            popup: '@',
            add: '@',
            edit: '@',
            delete: '@',
            relatorio: '@',
            autopage: '@',
            label: '@',
            parentkey: '@',
            editinline: '='

        }, link: function ($scope, $element, attrs) {
            var HtmlFormBody = "";

            HtmlFormBody += "<div class='card-panel'><h4 class='header2'>" + $scope.label + "</h4><div class='row' ng-init='init()' ng-hide='nopacess'><a href='{{adicionar}}' ng-show='exibirAdd()' class='btn btn-labeled btn-primary'>Add New</a>";
            for (var key in $scope.fields) {

                if ($scope.fields[key].readonly == undefined) {
                    $scope.fields[key].readonly = false;
                }

                if ($scope.fields[key].filter == 'true') {
                    $scope.habilitaBotao = true;
                    HtmlFormBody += "<div class='form-group col m2' id='sign-up-form'>";
                    HtmlFormBody += "<label ng-class='inputClass' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                    HtmlFormBody += "<input type='text' class='form-control' id='" + $scope.fields[key].name + "' ng-model='querydapesquisa." + $scope.fields[key].name + "'>";
                    HtmlFormBody += "</div>";
                }
                if ($scope.fields[key].combo == 'true') {
                    $scope.habilitaBotao = true;
                    $scope.getCombo($scope.fields[key]);
                    HtmlFormBody += "<div class='form-group col m2' id='sign-up-form'>";
                    HtmlFormBody += "<label ng-class='inputClass' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                    HtmlFormBody += "<select class='browser-default active' id='" + $scope.fields[key].name + "' required ng-model='querydapesquisa." + $scope.fields[key].name + "' ng-options='x." + $scope.fields[key].fieldid + " as x." + $scope.fields[key].fieldname + " for x in " + $scope.fields[key].model + "'><option value='Todos'></option></select>";
                    HtmlFormBody += "</div>";
                }
            }

            HtmlFormBody += "<div ng-show='habilitaBotao' class='right col s1'><a ng-click='pesquisar()' class='btn-floating btn-small waves-effect waves-light'><i class='mdi-action-search'></i></a></div>";
            HtmlFormBody += "<table class='striped'><thead><tr>";
            HtmlFormBody += "<th ng-repeat='field in fields' class='text-center' id='Sistema.Id' style='cursor:pointer; text-align:center;'>{{field.value}}</th>";
            HtmlFormBody += "<th  ng-show='exibir(" + $scope.strupdate + ")' style='text-align:center;'>Editar</th>";
            HtmlFormBody += "<th  ng-show='exibir(" + $scope.calculate + ")' style='text-align:center;'>" + $scope.calculatetitle + "</th>";
            HtmlFormBody += "<th  ng-show='exibir(update)' style='text-align:center;'>Ações</th>";
            HtmlFormBody += "<th  ng-show='exibir(relatorio)' style='text-align:center;'>Ações</th></tr></thead>";
            HtmlFormBody += "<th  ng-show='exibir(\"" + $scope.view + "\" == \"Relatorio\")' style='text-align:center;'>Ações</th></tr></thead>";


            if ($scope.editinline) {
                HtmlFormBody += "<tbody>";
                HtmlFormBody += "<tr ng-repeat='datum in data' style='cursor:pointer' title='Clique para editar'>";

                HtmlFormBody += "<td ng-repeat='field in fields' ng-click='edited=datum;rowform.$show()' style='text-align:center;' ng-class='trocaCor(field, datum)'>";
                HtmlFormBody += "<span editable-text='datum.{{field.name}}' e-name='{{field.name}}' e-form='rowform' ng-show='true'>{{verifica(datum[field.name],field.sub, field.type, field.uiFilter)}}</span>";
                HtmlFormBody += "</td>";

                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(" + $scope.strupdate + ")' style='text-align:center;'>";
                HtmlFormBody += "<a ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;";
                HtmlFormBody += "</td>";

                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(" + $scope.calculate + ")' style='text-align:center;'>";
                HtmlFormBody += "<a href ='#' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-action-assessment  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;";
                HtmlFormBody += "</td>";


                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(update)' style='text-align:center;'> <a ng-click='select(datum)'>";
                HtmlFormBody += "<i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>";
                HtmlFormBody += "<a ng-show='deleteDisabled()' ng-click='delete(datum)' aria-hidden='true'><i class='mdi-action-delete estre-darkgreen-icon  small icon-demo'></i></a>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(relatorio)' style='text-align:center;'>";
                HtmlFormBody += "<a href='#/" + $scope.view + '/' + "{{datum.id}}' ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a><a ng-show='exibir(relatorio)' href='/visualizacao?id={{datum.id}}' target='_blank' ng-click='select(datum)'><i class='mdi-action-print  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;";
                HtmlFormBody += "</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(\"" + $scope.view + "\" == \"Relatorio\")' style='text-align:center;'><a href='#/" + $scope.view + '/' + "{{datum.id}}' ng-click='select(datum)'>";
                HtmlFormBody += "<i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>";
                HtmlFormBody += "</td>"
                HtmlFormBody += "<td style='white-space: nowrap'>";
                HtmlFormBody += "<form editable-form name='rowform' ng-show='rowform.$visible' class='form-buttons form-inline' onbeforesave='save(datum)' ng-show='rowform.$visible' shown='edited == datum'>";
                HtmlFormBody += "<button type='submit' ng-disabled='rowform.$waiting' style='border:none; background: none !important;' >";
                HtmlFormBody += "<i class='mdi-navigation-check estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i>";
                HtmlFormBody += "</button>";
                HtmlFormBody += "<a ng-disabled='rowform.$waiting' ng-click='rowform.$cancel()' >";
                HtmlFormBody += "<i class='mdi-navigation-close estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i>";
                HtmlFormBody += "</a>";
                HtmlFormBody += "</form>";
                HtmlFormBody += "<div class='buttons' ng-show='!rowform.$visible'>";
                HtmlFormBody += "<a ng-click='delete(datum)'><i class='mdi-action-delete estre-darkgreen-icon  small icon-demo'></i></a>";
                HtmlFormBody += "</div>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "</tr>";
                HtmlFormBody += "</tbody>";
                HtmlFormBody += "<tfoot>";
                HtmlFormBody += "<tr ng-hide='habilitaPaginacao'>";
                HtmlFormBody += "<td colspan='3' class='row'>";
                HtmlFormBody += "<div>";
                HtmlFormBody += "<ul class='pagination'>";
                HtmlFormBody += "<li><a href='' ng-click='(ActualPage == 1) || voltaUmaPagina(ActualPage)'>«</a></li>";
                HtmlFormBody += "<li ng-repeat='page in TotalPages' ><a href='' ng-click='Pagina(page)'>{{page}}</a></li>";
                HtmlFormBody += "<li><a href='' ng-click='(ActualPage == TotalPages.length) || avancaUmaPagina(ActualPage)'>»</a></li>";
                HtmlFormBody += "</ul>";
                HtmlFormBody += "</div>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "<td>";
                HtmlFormBody += "<div class='row pull-right'><div class='input-field col s2'>";
                HtmlFormBody += "<a href='#/" + $scope.view + '/' + "new' ng-show='exibir(relatorio)' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a>";
                HtmlFormBody += "</div>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "</tr>";
                HtmlFormBody += "<tr ng-show='habilitaPaginacao'>";
                HtmlFormBody += "<td colspan='3' class='row'>";
                HtmlFormBody += "<div>";
                HtmlFormBody += "<ul class='pagination'>";
                HtmlFormBody += "<li><a>«</a></li>";
                HtmlFormBody += "<li ng-repeat='page in TotalPagesSearch' ><a href='' ng-click='PaginaSearch(page)'>{{page}}</a></li>";
                HtmlFormBody += "<li><a >»</a></li>";
                HtmlFormBody += "</ul>";
                HtmlFormBody += "</div>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "<td>";
                HtmlFormBody += "<div class='row pull-right'>";
                HtmlFormBody += "<div class='input-field col s2'>";
                HtmlFormBody += "<a href='#/" + $scope.view + '/' + "new' ng-show='exibir(relatorio)' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a>";
                HtmlFormBody += "</div>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "</tr>";
                HtmlFormBody += "</tfoot>";
            } else {
                HtmlFormBody += "<tbody><tr ng-repeat='datum in data' ng-click='ViewItem(datum)' style='cursor:pointer'><td ng-repeat='field in fields' style='text-align:center;' ng-class='trocaCor(field, datum)'>";
                HtmlFormBody += "<span ng-repeat='(key, value) in datum ' ng-show='(key==field.name)'>{{ verifica(value,field.sub, field.type, field.uiFilter)}}</span></td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(" + $scope.strupdate + ")' style='text-align:center;'><a ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;</td>";

                var anchor = (undefined != $scope.calculate && '' != $scope.calculate) ? "<a  ng-click='calc(datum)'>" : "<a ng-click='select(datum)'>";

                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(" + $scope.calculate + ")' style='text-align:center;'>" + anchor + "<i class='mdi-action-assessment  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(update)' style='text-align:center;'> <a ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>";
                HtmlFormBody += "<a ng-show='deleteDisabled()'  ng-click='delete(datum)' aria-hidden='true'><i class='mdi-action-delete estre-darkgreen-icon  small icon-demo'></i></a>";
                HtmlFormBody += "</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(relatorio)' style='text-align:center;'><a href='#/" + $scope.view + '/' + "{{datum.id}}' ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a><a ng-show='exibir(relatorio)' href='/visualizacao?id={{datum.id}}' target='_blank' ng-click='select(datum)'><i class='mdi-action-print  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(\"" + $scope.view + "\" == \"Relatorio\")' style='text-align:center;'><a href='#/" + $scope.view + '/' + "{{datum.id}}' ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a></td"
                HtmlFormBody += "</tr></tbody><tfoot>";
                HtmlFormBody += " <tr ng-hide='habilitaPaginacao'><td colspan='3' class='row'><div><ul class='pagination'><li><a href='' ng-click='(ActualPage == 1) || voltaUmaPagina(ActualPage)'>«</a></li><li ng-repeat='page in TotalPages' ><a href='' ng-click='Pagina(page)'>{{page}}</a></li><li><a href='' ng-click='(ActualPage == TotalPages.length) || avancaUmaPagina(ActualPage)'>»</a></li></ul></div></td><td><div class='row pull-right'><div class='input-field col s2'><a href='#/" + $scope.view + '/' + "new' ng-show='exibir(relatorio)' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a></div></td></tr>";
                HtmlFormBody += "<tr ng-show='habilitaPaginacao'><td colspan='3' class='row'><div><ul class='pagination'><li><a>«</a></li><li ng-repeat='page in TotalPagesSearch' ><a href='' ng-click='PaginaSearch(page)'>{{page}}</a></li><li><a >»</a></li></ul></div></td><td><div class='row pull-right'><div class='input-field col s2'><a href='#/" + $scope.view + '/' + "new' ng-show='exibir(relatorio)' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a></div></td></tr>";
                HtmlFormBody += "</tfoot>";
            }
            HtmlFormBody += "</table></div></div>";

            if ($scope.popup == 'true')
                HtmlFormBody += "<button ng-click='modalViewmodal()' class='btn btn-large ' aria-hidden='false'>Adicionar</button>"

            $element.replaceWith($compile(HtmlFormBody)($scope));

        },
        controller: function ($scope, $element, $http, $filter) {
            $scope.data = ([]);
            $scope.querydapesquisa = ({});
            $scope.me = window.SAILS_LOCALS;
            $scope.ActualPage = 1;
            $scope.skip = 0;
            $scope.TotalItens = 0;
            $scope.TotalPages = ([]);
            $scope.ActualPageSearch = 1;
            $scope.skipSearch = 0;
            $scope.TotalItensSearch = 0;
            $scope.TotalPagesSearch = ([]);
            $scope.edited = ([]);
            $scope.nopacess = false;


            for (var key in $scope.noacess) {
                if ($scope.noacess[key].perfil == $scope.me._perfil) {
                    $scope.nopacess = true;
                }
            }



            $scope.pesquisar = function () {
                var query = "";
                for (var key in $scope.querydapesquisa) {
                    query += key + "=" + $scope.querydapesquisa[key] + "&";
                }

                $http({
                    method: 'GET',
                    url: '/' + $scope.view + '/searchCount?' + query,
                }).then(function onSuccess(sailsResponse) {
                    $scope.refreshPageCountSearch(sailsResponse.data);

                    $http({
                        method: 'GET',
                        url: '/' + $scope.view + '/search?' + query + "skip=" + $scope.skipSearch + "&limit=" + $scope.pagesize,
                    }).then(function onSuccess(sailsResponse) {
                        $scope.refreshPageSearch(sailsResponse.data);
                        $scope.habilitaPaginacao = true;
                    })
                    .catch(function onError(sailsResponse) {
                        // $scope.sennitForm.loading = false;
                    })
                    .finally(function eitherWay() {
                        // $scope.sennitForm.loading = false;
                    });
                })
                .catch(function onError(sailsResponse) {
                    // $scope.sennitForm.loading = false;
                })
                .finally(function eitherWay() {
                    // $scope.sennitForm.loading = false;
                });
            };

            $scope.modalViewmodal = function () {
                $('#modalView').openModal();
            }

            $scope.save = function (data) {

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

                            if ($scope.parentkey !== undefined) {
                                var item = ([]);
                                eval(" item={'" + $scope.parentkey + "':'" + $scope.$parent.data.id + "'};");
                                angular.extend(data, item);
                            }

                            var params = {};
                            for (var field in $scope.fields) {
                                params[$scope.fields[field].name] = data[$scope.fields[field].name];
                            }

                            $http({
                                method: 'PUT',
                                url: '/' + $scope.listaname + '/' + data.id,
                                data: params
                                //data: data
                            }).then(function onSuccess(sailsResponse) {
                                $scope.inputClass = null;
                                $scope.inputClass = "disabled";
                                swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                                Materialize.toast('Registro alterado com sucesso!', 4000);
                                return true;
                            })
                            .catch(function onError(sailsResponse) {
                                swal("Erro", "Seu registro não foi alterado :(", "error");
                                return false;
                            })
                            .finally(function eitherWay() {
                                $scope.sennitForm.loading = false;
                            })
                        } else {
                            swal("Cancelado", "Seu registro não foi alterado :(", "error");
                            return false;
                        }
                    }
                );
            }

            $scope.trocaCor = function (field, data) {
                var keys = Object.keys(data);
                if (keys[0] == field.name && (undefined != data[field.name])) {
                    if (typeof data[field.name] == "object") return;
                    return data[field.name].replace("á", "a").replace("ç", "c").replace("ã", "a").toLowerCase();
                }
            };


            $scope.refreshPageCountSearch = function (results) {
                $scope.TotalItensSearch = results;
                var range = [];
                var total = ($scope.TotalItensSearch / $scope.pagesize);
                for (var i = 0; i < total; i++) {
                    range.push(i + 1);
                }
                $scope.TotalPagesSearch = range;
            };


            $scope.refreshPageSearch = function (results) {
                $scope.data = angular.fromJson(results);
            };

            $scope.PaginaSearch = function (page) {
                $scope.skipSearch = ((page - 1) * $scope.pagesize);
                $scope.ActualPageSearch = page;
                $scope.pesquisar();
            };

            $scope.exibir = function (value) {
                return (value != undefined && value != "false" && value != false);
            }

            $scope.exibirAdd = function () {
                if ($scope.add == "false")
                    return false;

                return true;
            }

            $scope.deleteDisabled = function () {
                return ($scope.strdelete != 'false')
            };

            $scope.verifica = function (valor, nome, type, filtro) {
                if (valor == null) return;
                if (valor.hasOwnProperty(nome)) {

                    for (key in valor) {

                        if (key == nome)
                            return valor[key];
                    }
                }
                if (type == "date" || type == "datepicker") {
                    return getDate(valor);
                }

                if (type == "datetimepicker") {
                    return getDateTimeString(valor);
                }

                if (type == "usuario") {
                    return valor.name;
                }
                if (typeof valor === "boolean") {
                    if (valor == true) {
                        return "✔";
                    }
                    else {
                        return "✖";
                    }
                }

                return (filtro) ? $filter(filtro)(valor) : valor;
            }
            $scope.getCombo = function (field) {
                if (field.datarest) {
                    $scope[field.model] = JSON.parse(field.datarest);
                }
                else {
                    $http.get("/" + field.api).then(function (results) {
                        $scope[field.model] = results.data;
                    });
                }
            };


            $scope.init = function () {

                $scope.$watch('$parent.refreshChilds', function (newValue, oldValue) {
                    if (newValue == true) {
                        $scope.refreshPage();
                        $scope.$parent.refreshChilds = false;
                    }
                });

                var isChild = $scope.parentkey !== undefined;

                if (isChild) {
                    $scope.$watch('$parent.data', function (newValue, oldValue) {
                        if (newValue !== undefined && newValue != null && newValue.id !== undefined) {
                            $scope.refreshPage(newValue.id);
                        }
                    });
                } else {
                    $scope.refreshPage();
                }
            };

            $scope.refreshPage = function (id) {
                if (id == undefined && undefined != $scope.parentkey)
                    id = $scope.$parent.data.id;

                var parent = "";
                var countUrl = "/" + $scope.listaname + "/count";
                var plus = ($scope.listaname.indexOf("?") < 0) ? "?" : "&";

                if ($scope.parentkey !== undefined) {
                    parent = $scope.parentkey + "=" + id;
                    countUrl += plus + parent;
                }

                $http.get(countUrl).then(function (results) {

                    $scope.TotalItens = results.data.count;
                    var range = [];
                    var total = ($scope.TotalItens / $scope.pagesize);
                    for (var i = 0; i < total; i++) {
                        range.push(i + 1);
                    }
                    $scope.TotalPages = range;
                });

                var query;
                for (var key in $scope.fields) {
                    if (query)
                        query += $scope.fields[key].name + ',';
                    else
                        query = $scope.fields[key].name + ',';
                }

                if ($scope.fields.length)
                    query = query.substring(0, query.length - 1);


                $http.get("/" + $scope.listaname + plus + "skip=" + $scope.skip + '&' + parent + "&limit=" + $scope.pagesize).then(function (results) {
                    $scope.data = angular.fromJson(results.data);
                });
            };

            $scope.Pagina = function (page) {
                $scope.skip = ((page - 1) * $scope.pagesize);
                $scope.ActualPage = page;
                $scope.refreshPage();
            };
            $scope.voltaUmaPagina = function (page) {
                var anterior = page - 1;
                $scope.Pagina(anterior);
            };

            $scope.avancaUmaPagina = function (page) {
                var posterior = page + 1;

                $scope.Pagina(posterior);
            };
            $scope.$on('handleBroadcastItem', function () {
                $scope.data.push(angular.fromJson(sennitCommunicationService.datum.data));
                $scope.refreshPage();
            });

            $scope.select = function (msg) {
                sennitCommunicationService.prepForBroadcast(msg);
            };

            $scope.calc = function (msg) {
                sennitCommunicationService.prepForBroadcast(msg, 'calculate');
            };

            $scope.delete = function (item) {

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
                            $http.delete('/' + $scope.listaname + '/' + item.id)
                            .then(function (project) {
                                var index = $scope.data.indexOf(item);
                                $scope.data.splice(index, 1);
                                $scope.refreshPage();
                            });
                        } else {
                            swal("Cancelado", "Seu registro está seguro :)", "error");
                        }
                    }
                );
            };
        }

    }
}]).directive('formView', ['$compile', 'sennitCommunicationService', function ($compile, sennitCommunicationService, $http) {
    return {
        restrict: 'E',
        scope: {
            fields: '=',
            datasource: '=',
            adicionarperfil: '=',
            updateperfil: '=',
            listaname: '@',
            noacess: '=',
            strupdate: '@',
            nocard: '@',
            strnew: '@',
            redirecionar: '@',
            label: '@'


        }, link: function ($scope, $element, attrs, $http) {

            var HtmlFormBody = " <div class='card-panel' ng-init='init()' ><h4 class='header2'>" + $scope.label + "</h4><div class='row' ng-hide='nopacess'><form class='col s12'  ng-submit='save()' id='sign-up-form' >";

            if ($scope.nocard)
                HtmlFormBody = " <div  ng-init='init()' ><h4 class='header2'>" + $scope.label + "</h4><div class='row'><form class='col s12'  ng-submit='save()' id='sign-up-form' >";


            if ($scope.strupdate == 'false')
                HtmlFormBody += "";
            else
                HtmlFormBody += "";
            for (var key in $scope.fields) {
                switch ($scope.fields[key].type) {

                    case 'table-add-remove':

                        //'tableadd': { 'model': 'usuarios' , 'text': 'name', 'valuesource': 'id' }
                        if ($scope.fields[key].tableadd) {
                            HtmlFormBody += "<div class='form-group' >";
                            HtmlFormBody += "<label for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                            HtmlFormBody += "<select  id='" + $scope.fields[key].name + "'  class='form-control emailReminder width-169 ng-pristine ng-invalid ng-invalid-required ng-touched' ng-model='combodata." + $scope.fields[key].name + "' ng-options='x as x." + $scope.fields[key].tableadd.text + " for x in " + $scope.fields[key].tableadd.model + "' value=''></select>";
                            HtmlFormBody += "</select>";
                            HtmlFormBody += "<td class='col-lg-2 col-md-3 col-sm-4 text-center'>";
                            HtmlFormBody += "<button type='button' class='mb-sm btn btn-labeled btn-primary' ng-click='Associate(combodata." + $scope.fields[key].name + ",&#39;" + $scope.fields[key].name + "&#39;,&#39;" + $scope.fields[key].name + "&#39; ,&#39;" + $scope.fields[key].tableadd.apiadd + "&#39;, &#39;add&#39;)' aria-label='Left Align'>";
                            HtmlFormBody += " Add <i class='fa fa-plus'></i>";
                            HtmlFormBody += "</button>";
                            HtmlFormBody += "</td>";
                            HtmlFormBody += "</div>";
                        }


                        HtmlFormBody += "<table class='table table-bordered table-hover'>";
                        HtmlFormBody += "<thead class='thead-sennit'>";
                        HtmlFormBody += "<tr>";
                        HtmlFormBody += "<th class='col-lg-1 col-md-3 col-sm-3 text-center'>" + $scope.fields[key].name + "</th>";
                        HtmlFormBody += "<th class='col-lg-2 col-md-3 col-sm-4 text-center'>Actions</th>";
                        HtmlFormBody += "</tr>";
                        HtmlFormBody += "</thead>";
                        HtmlFormBody += "<tbody>";
                        HtmlFormBody += "<tr data-ng-repeat='datum in data." + $scope.fields[key].name + "' class='ng-scope'>";
                        HtmlFormBody += "<td class='col-lg-1 col-md-2 col-sm-3 ng-binding'>";
                        HtmlFormBody += "{{datum." + $scope.fields[key].text + " }}";
                        HtmlFormBody += "</td>";
                        HtmlFormBody += "<td class='col-lg-2 col-md-3 col-sm-4 text-center'>";
                        HtmlFormBody += "<button type='button' class='mb-sm btn btn-danger' ng-click='Associate(datum, &#39;" + $scope.fields[key].name + "&#39;,&#39;" + $scope.fields[key].tableadd.valuesource + "&#39; ,&#39;" + $scope.fields[key].tableadd.apidelete + "&#39;, &#39;delete&#39;)' aria-label='Left Align'>";
                        HtmlFormBody += " <i class='fa fa-trash' aria-hidden='true'></i>";
                        HtmlFormBody += "</button>";
                        HtmlFormBody += "</td>";
                        HtmlFormBody += "</tr>";
                        HtmlFormBody += "</tbody>";
                        HtmlFormBody += "</table>";


                        break;
                    case 'listbox-multiple':

                        HtmlFormBody += "<div class='input-field col s12'>";
                        HtmlFormBody += "<label for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                        HtmlFormBody += "<select multiple id='" + $scope.fields[key].name + "' required ng-multiple='true' ng-model='data." + $scope.fields[key].name + "' ng-options='x as x." + $scope.fields[key].text + " for x in " + $scope.fields[key].model + "' value=''></select>";
                        HtmlFormBody += "</select>";
                        HtmlFormBody += "</div>";
                        break;

                    case 'listview':
                        HtmlFormBody += "<div class='row'><div class='input-field col s12'> ";
                        HtmlFormBody += "<label  ng-class='inputClass' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                        HtmlFormBody += "<input class='col s11' type='text' ng-model='" + $scope.fields[key].input + "' " + $scope.fields[key].uiMask + "></input>";
                        HtmlFormBody += "<div class='col s1'><a ng-click='addItem(" + $scope.fields[key].input + ",\"" + $scope.fields[key].model.trim() + "\",\"" + $scope.fields[key].input + "\" )' class='btn-floating btn-small waves-effect waves-light' aria-hidden='false'><i class='mdi-content-add'></i></a></div>";
                        HtmlFormBody += "<table class='striped col s11'><thead><tr>";
                        HtmlFormBody += "<th ng-repeat='field in fields[" + key + "].fields' class='text-center' id='Sistema.Id' style='cursor:pointer'>{{field.value}}</th><th>Ações</th></tr></thead>";
                        HtmlFormBody += "<tbody><tr ng-repeat='datum in data." + $scope.fields[key].model + "' ng-click='ViewItem(datum)' style='cursor:pointer'><td ng-repeat='field in fields[" + key + "].fields' >";
                        HtmlFormBody += "<span ng-repeat='(key, value) in datum ' ng-show='(key==field.name)'>{{ verifica(value,field.sub, field.type, field.uiFilter)}}</span></td><td title='Remover'><a ng-click=\"removeItem(datum,'" + $scope.fields[key].model.trim() + "')\"><i class='mdi-action-delete estre-darkgreen-icon  small icon-demo'></i></a></td>";
                        HtmlFormBody += "</tr></tbody></table>";
                        HtmlFormBody += "</div></div>";
                        break;
                    case 'checkbox':
                        HtmlFormBody += "<div class='row'><div class='collection-item dismissable'><div class='input-field col s12'><input type='checkbox'  ng-model='data." + $scope.fields[key].name + "'  id='" + $scope.fields[key].name + "' /><label for='" + $scope.fields[key].name + "' >" + $scope.fields[key].value + "</label></div></div></div>";

                        break;
                    case 'textAngular':
                        HtmlFormBody += "<div class='row'><div class='collection-item dismissable'><div class='input-field col s12'><label for='" + $scope.fields[key].name + "' >" + $scope.fields[key].value + "</label><br><br><div class='row'><div class='col s12'><div text-angular ng-change='change(\"" + $scope.fields[key].name + "\"," + $scope.fields[key].name + ")' ng-model='" + $scope.fields[key].name + "'></div></div></div></div></div></div>";
                        break;
                    case 'usuario':
                        break;

                    case 'date':
                    case 'datepicker':
                        var value = getDate($scope.fields[key].value);
                        HtmlFormBody += "<div class='row'><div class='input-field col s12'><input class='date datepicker' type='text' name='" + $scope.fields[key].name + "' ng-model='data." + $scope.fields[key].name + "'></input><label  ng-class='inputClass'   for='" + $scope.fields[key].name + " '>" + value + "</label></div></div>";
                        break;

                    case 'datetimepicker':
                        var value = getDate($scope.fields[key].value);
                        HtmlFormBody += "<div class='row'><div class='input-field col s12'><input class='datetimepicker' type='text' name='" + $scope.fields[key].name + "' ng-model='data." + $scope.fields[key].name + "'></input><label  ng-class='inputClass'   for='" + $scope.fields[key].name + " '>" + value + "</label></div></div>";
                        break;

                    case 'combobox':

                        $scope.getCombo($scope.fields[key]);

                        HtmlFormBody += "<div class='row'><div class='input-field col s12'>";
                        HtmlFormBody += "<label class='active' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                        HtmlFormBody += "<select class='browser-default active' id='" + $scope.fields[key].name + "' required ng-model='data." + $scope.fields[key].name + "' ng-options='x as x." + $scope.fields[key].fieldname + " for x in " + $scope.fields[key].model + " track by x." + $scope.fields[key].fieldid + "'><option value='Todos'></option></select>";
                        HtmlFormBody += "</div></div>";

                        break;
                    case 'comboboxmulti':
                        $scope.getCombo($scope.fields[key]);
                        HtmlFormBody += "<div class='row'><div class='input-field col s12'>";
                        HtmlFormBody += "<label class='active' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                        HtmlFormBody += "<div   style='margin-top: 10px' isteven-multi-select input-model='" + $scope.fields[key].model + "' item-label='icon perfil name'  button-label='icon name' tick-property='teste'  output-model='data." + $scope.fields[key].name + "' ></div>";
                        HtmlFormBody += "</div></div>";
                        break;

                    case 'number':
                        HtmlFormBody += "<div class='row'><div class='input-field col s12'><input type='number' ng-model='data." + $scope.fields[key].name + "' " + $scope.fields[key].uiMask + "></input><label  ng-class='inputClass'   for='" + $scope.fields[key].name + " '>" + $scope.fields[key].value + "</label></div></div>";

                        break;

                    default:
                        HtmlFormBody += "<div class='row'><div class='input-field col s12'><input type='text' ng-model='data." + $scope.fields[key].name + "' " + $scope.fields[key].uiMask + "></input><label  ng-class='inputClass'   for='" + $scope.fields[key].name + " '>" + $scope.fields[key].value + "</label></div></div>";
                        break;
                }

            }


            HtmlFormBody += "<div class='row' >&nbsp;</div><div class='row' ng-hide='(nopNew && nopUpdate)'><div class='input-field col s12'><a ng-click='newitem()' ng-hide='nopNew' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a><button ng-show='verificaBotaoSubmit()' type='submit' class='btn cyan waves-effect waves-light right' ><span ng-show='!sennitForm.loading'>Submeter</span>";
            HtmlFormBody += "<span class='overlord-loading-spinner fa fa-spinner' ng-show='sennitForm.loading' ></span>";
            HtmlFormBody += "<span ng-show='sennitForm.loading'>Aguarde...</span></button></div></div>";


            HtmlFormBody += "</div></div></div> <input type='hidden' name='_csrf' value='<%= _csrf %>' /></form></div>";

            $element.replaceWith($compile(HtmlFormBody)($scope));

            $('.datepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY', time: false });
            $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' });

        },
        controller: function ($scope, $element, $http, $location, $routeParams, $parse, $filter) {
            $scope.me = window.SAILS_LOCALS;
            $scope.combodata = ([]);
            $scope.combos = ([]);
            $scope.modelComboBox = ([]);
            $scope.sennitForm = {
                loading: false
            }
            $scope.nopNew = true;
            $scope.nopUpdate = true;
            $scope.inputClass = "";
            $scope.data = ({});
            $scope.url = ([]);


            $scope.nopacess = false;


            for (var key in $scope.noacess) {
                if ($scope.noacess[key].perfil == $scope.me._perfil) {
                    $scope.nopacess = true;
                }
            }


            for (var key in $scope.adicionarperfil) {
                if ($scope.adicionarperfil[key].perfil == $scope.me._perfil) {
                    $scope.nopNew = false;
                }
            }

            for (var key in $scope.updateperfil) {

                if ($scope.updateperfil[key].perfil == $scope.me._perfil) {
                    $scope.nopUpdate = false;
                }
            }

            $scope.removeItem = function (item, model) {

                var index = $scope.data[model].indexOf(item);
                $scope.data[model].splice(index, 1);

                /*swal({   title: "",   
                        text: "Você tem certeza que deseja remover este registro?",   
                        type: "info",   
                        showCancelButton: true, 
                        confirmButtonText: "Sim",   
                        cancelButtonText: "Cancelar",   
                        closeOnConfirm: false,   
                        closeOnCancel: false }, 
                        function(isConfirm){   
                            if (isConfirm) {     
                                 
                                var index = $scope.data[model].indexOf(item);
                                $scope.data[model].splice(index, 1);  
                                swal("Registro Removido!", "Seu registro foi removido com sucesso.", "success");
                            } else {
                                swal("Cancelado", "Seu registro não foi removido :(", "error");   
                            } 
                        }
                    );  */
            };


            $scope.verifica = function (valor, nome, type, filtro) {
                if (valor.hasOwnProperty(nome)) {

                    for (key in valor) {

                        if (key == nome)
                            return valor[key];
                    }
                }
                if (type == "date" || type == "datepicker") {
                    return getDate(valor);
                }

                if (type == "datetimepicker") {
                    return getDateTimeString(valor);
                }

                if (type == "usuarios") {
                    return valor.name;
                }
                if (typeof valor === "boolean") {
                    if (valor == true) {
                        return "✔";
                    }
                    else {
                        return "✖";
                    }
                }
                if (filtro)
                    return $filter(filtro)(valor);
                else
                    return valor;
            }
            $scope.comboFields = [];

            $scope.getCombo = function (field, index) {

                if (field.datarest) {
                    $scope[field.model] = JSON.parse(field.datarest);
                }
                else {
                    $scope.comboFields.push(field);

                    $http.get("/" + field.api).then(function (results) {
                        $scope[field.model] = results.data;

                        angular.forEach($scope[field.model], function (value, key) {

                            if ($scope[field.model][key].aterros) {
                                delete $scope[field.model][key].aterros;
                            }
                            angular.extend($scope[field.model][key], { 'teste': false, icon: "<img src='/images/" + $scope[field.model][key].perfil + ".png' ></img>" });
                        });
                    });
                }
            };

            $scope.init = function () {
                $('input.materialize-textarea').characterCounter();
                for (var key in $scope.fields) {
                    switch ($scope.fields[key].type) {
                        case 'listview':
                            $scope.data[$scope.fields[key].model] = ([]);
                            $scope[$scope.fields[key].input] = "";
                            break;
                        case 'textAngular':
                            $scope.data[$scope.fields[key].name] = "";

                            break;
                        case 'usuario':
                            $scope.data[$scope.fields[key].name] = $scope.me._id;

                            break;
                        default:
                            $scope.data[$scope.fields[key].name] = "";
                            break;
                    }
                }
            }

            $scope.addItem = function (coeficiente, model, input, fields) {
                var date = new Date();
                var dateISO = date.toISOString();

                $scope.data[model].push({ 'coeficienteRU': coeficiente, 'date': dateISO });
                $scope[input] = "";
            };

            $scope.change = function (model, data) {
                $scope.data[model] = data;
                $('select').material_select();
            }

            $scope.newitem = function () {
                $scope.init();
                $scope.inputClass = "";
                $('select').material_select();
            };

            $scope.unSelectMultiCombo = function () {
                angular.forEach($scope.comboFields, function (v, k) {
                    angular.forEach($scope[v.model], function (value, key) {

                        if ($scope[v.model][key].aterros) {
                            delete $scope[v.model][key].aterros;
                        }
                        angular.extend($scope[v.model][key], { 'teste': false, icon: "<img src='/images/" + $scope[v.model][key].perfil + ".png' ></img>" });
                    });
                });
            };

            $scope.formatDateFields = function () {
                for (var field in $scope.fields) {
                    if ($scope.fields[field].type == "date" || $scope.fields[field].type == "datepicker") {
                        var dt = getDate($scope.data[$scope.fields[field].name]);
                        $scope.data[$scope.fields[field].name] = dt;
                        $("input[name=" + $scope.fields[field].name + "]").val(dt);
                    }

                    if ($scope.fields[field].type == "datetimepicker") {
                        var dt = getDateTimeString($scope.data[$scope.fields[field].name]);
                        $scope.data[$scope.fields[field].name] = dt;
                        $("input[name=" + $scope.fields[field].name + "]").val(dt);
                    }
                }
            };
            $scope.setSelectedItensMultiCombo = function () {
                for (var key in $scope.fields) {
                    if ($scope.fields[key].type == 'comboboxmulti') {
                        angular.forEach($scope[$scope.fields[key].model], function (value, keyItem) {
                            for (var item in $scope.data[$scope.fields[key].name]) {
                                if ($scope.data[$scope.fields[key].name][item].id == value.id) {
                                    angular.extend($scope[$scope.fields[key].model][keyItem], { 'teste': true, icon: "<img src='/images/user_icon.png' ></img>" });
                                }
                            }
                        });
                    }
                }

            };

            $scope.$on('handleBroadcast', function () {
                $scope.data = sennitCommunicationService.data;
                $scope.unSelectMultiCombo();
                $scope.formatDateFields();
                $scope.setSelectedItensMultiCombo();
                $scope.inputClass = "active";
                $('select').material_select();
                $scope.setSelectedItensMultiCombo();
            });


            $scope.Associate = function (value, model, id, api, type) {

                var idAssossiate = "id";
                var dataAssossiate = '{ "' + id + '": "' + value[idAssossiate] + '" , "id": "' + $routeParams.id + '"}';
                $http.post('/' + api, dataAssossiate)
                    .then(function (project) {
                        if (type == "add")
                            $scope.data[model].push(value);
                        else
                            $scope.data[model].splice($scope.getResourceIndex($scope.data[model], value), 1);
                    });
            };
            $scope.newDisabled = function () {
                if ($scope.strnew == 'false')
                    return false

                return true;
            };


            $scope.verificaBotaoSubmit = function () {
                if ($scope.strnew == 'false' && typeof $scope.data.id == "undefined")
                    return false;

                return true;
            };


            $scope.getResourceIndex = function (resources, resource) {
                var index = -1;
                for (var i = 0; i < resources.length; i++) {
                    if (resources[i].id == resource.id) {
                        index = i;
                    }
                }
                return index;
            }



            $scope.save = function () {

                $scope.sennitForm.loading = true;
                if ($scope.data.mes) {
                    $scope.data.mes = $scope.data.mes.id;

                }
                if ($scope.data.id) {

                    if (!$scope.nopUpdate) {

                        $scope.sennitForm.loading = true;

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



                                        var params = {};
                                        for (var field in $scope.fields) {
                                            params[$scope.fields[field].name] = $scope.data[$scope.fields[field].name];
                                        }

                                        $(".datepicker").each(function (i, el) {
                                            var value = $(this).val().split("/");
                                            params[$(this).prop("name")] = new Date(value[2], parseInt(value[1]) - 1, value[0]);
                                            $scope.data[$(this).prop("name")] = $(this).val();
                                        });


                                        $(".datetimepicker").each(function (i, el) {
                                            params[$(this).prop("name")] = getDateTime($(this).val());
                                            $scope.data[$(this).prop("name")] = $(this).val();
                                        });


                                        $http({
                                            method: 'PUT',
                                            url: '/' + $scope.listaname + '/' + $scope.data.id,
                                            data: params
                                        }).then(function onSuccess(sailsResponse) {
                                            $scope.inputClass = null;
                                            $scope.data = ({});
                                            $scope.inputClass = "disabled";
                                            $scope.newitem();
                                            swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                                            Materialize.toast('Registro alterado com sucesso!', 4000);
                                        })
                                        .catch(function onError(sailsResponse) {

                                        })
                                        .finally(function eitherWay() {
                                            $scope.sennitForm.loading = false;
                                        })
                                    } else {
                                        swal("Cancelado", "Seu registro não foi alterado :(", "error");
                                    }
                                }
                            );
                    } else {
                        $scope.sennitForm.loading = false;
                    }

                } else {
                    if (!$scope.nopNew) {

                        swal({
                            title: "",
                            text: "Você tem certeza que deseja incluir este registro?",
                            type: "info",
                            showCancelButton: true,
                            confirmButtonText: "Sim",
                            cancelButtonText: "Cancelar",
                            closeOnConfirm: false,
                            closeOnCancel: false
                        },
                            function (isConfirm) {
                                if (isConfirm) {


                                    var params = {};
                                    for (var field in $scope.fields) {
                                        params[$scope.fields[field].name] = $scope.data[$scope.fields[field].name];
                                    }

                                    $(".datepicker").each(function (i, el) {
                                        var value = $(this).val().split("/");
                                        params[$(this).prop("name")] = new Date(value[2], parseInt(value[1]) - 1, value[0]);
                                        $scope.data[$(this).prop("name")] = $(this).val();
                                    });

                                    $(".datetimepicker").each(function (i, el) {
                                        params[$(this).prop("name")] = getDateTime($(this).val());
                                        $scope.data[$(this).prop("name")] = $(this).val();
                                    });


                                    var inJson = angular.toJson(params);
                                    query = JSON.parse(inJson);
                                    $http.post('/' + $scope.listaname, query)
                                    .then(function onSuccess(sailsResponse) {
                                        swal("Registro Incluido!", "Seu registro foi incluido com sucesso.", "success");
                                        Materialize.toast('Registro incluido com sucesso!', 4000);
                                        sennitCommunicationService.prepForBroadcastDataList(sailsResponse);
                                        $scope.newitem();
                                        $scope.sennitForm.loading = false;

                                    })
                                    .catch(function onError(sailsResponse) {
                                        swal("Erro", "Seu registro não foi salvo :(", "error");
                                        Materialize.toast('Falha ao inserir o registro!', 4000);
                                    })
                                    .finally(function eitherWay() {
                                        $scope.sennitForm.loading = false;
                                    })
                                } else {
                                    swal("Cancelado", "Seu registro não foi salvo :(", "error");
                                }
                            }
                        );
                    } else {

                        $scope.sennitForm.loading = false;
                    }
                }
            };
        }

    }
}]).factory('sennitCommunicationService', function ($rootScope) {
    var sennitCommunicationService = ([]);
    sennitCommunicationService.data = '';
    sennitCommunicationService.type = 'select';

    sennitCommunicationService.prepForBroadcast = function (data, type) {
        this.type = undefined == type ? 'select' : 'calculate';
        this.data = data;
        this.broadcastItem(type);
        $('select').material_select();
    };

    sennitCommunicationService.prepForBroadcastDataList = function (datum) {
        this.datum = datum;
        this.broadcastItemReturn();
        $('select').material_select();
    };

    sennitCommunicationService.broadcastItem = function (type) {
        $rootScope.$broadcast('handleBroadcast', type);
    };

    sennitCommunicationService.broadcastItemReturn = function () {
        $rootScope.$broadcast('handleBroadcastItem');
    };

    return sennitCommunicationService;
}).directive('myIframe', function () {
    var linkFn = function (scope, element, attrs) {
        element.find('iframe').bind('load', function (event) {
            event.target.contentWindow.scrollTo(0, 400);
        });
    };
    return {
        restrict: 'EA',
        scope: {
            src: '&src',
            height: '@height',
            width: '@width',
            scrolling: '@scrolling'
        },
        template: '<iframe class="frame" height="{{height}}" width="{{width}}" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="{{scrolling}}" src="{{src()}}"></iframe>',
        link: linkFn
    };
}).directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.customOnChange);
            element.bind('change', onChangeFunc);
        }
    };
}).directive('editView', ['$compile', 'sennitCommunicationService', function ($compile, sennitCommunicationService, $http) {
    return {
        restrict: 'E',
        scope: {
            fields: '=',
            datasource: '=',
            listaname: '@',
            strupdate: '@',
            nocard: '@',
            strnew: '@',
            redirecionar: '@',
            label: '@'


        }, link: function ($scope, $element, attrs, $http) {

            var HtmlFormBody = '<form editable-form name="editableForm" onaftersave="save()">';

            for (var key in $scope.fields) {
                HtmlFormBody += '<p>';
                HtmlFormBody += '<b>' + $scope.fields[key].value + ': </b>';

                switch ($scope.fields[key].type) {
                    case 'date':
                        HtmlFormBody += '<span editable-text="data.' + $scope.fields[key].name + '" e-name="' + $scope.fields[key].name + '" ng-model="' + $scope.fields[key].name + '">';
                        HtmlFormBody += '{{ (data.' + $scope.fields[key].name + ' | date:"dd/MM/yyyy") || "empty" }}';
                        HtmlFormBody += '</span>';
                        break;
                    case 'datepicker':
                        HtmlFormBody += '<span editable-text="data.' + $scope.fields[key].name + '" e-name="' + $scope.fields[key].name + '" ng-model="' + $scope.fields[key].name + '" e-class="datepicker" >';
                        HtmlFormBody += '{{ (data.' + $scope.fields[key].name + ' | date:"dd/MM/yyyy") || "empty" }}';
                        HtmlFormBody += '</span>';
                        break;

                    case 'datetimepicker':
                        HtmlFormBody += '<span editable-text="data.' + $scope.fields[key].name + '" e-name="' + $scope.fields[key].name + '" ng-model="' + $scope.fields[key].name + '" e-class="datetimepicker" >';
                        HtmlFormBody += '{{ (data.' + $scope.fields[key].name + ' | date:"dd/MM/yyyy HH:mm") || "empty" }}';
                        HtmlFormBody += '</span>';

                        break;

                    case 'textarea':
                        HtmlFormBody += '<span editable-textarea="data.' + $scope.fields[key].name + '" e-name="' + $scope.fields[key].name + '" e-rows="' + $scope.fields[key].rows + '" e-cols="' + $scope.fields[key].cols + '" e-style="width: ' + $scope.fields[key].width + '; height:' + $scope.fields[key].height + '" ng-model="' + $scope.fields[key].name + '">{{data.' + $scope.fields[key].name + '}}</span>';
                        break;

                    default:
                        if ($scope.fields[key].readonly == true) {
                            HtmlFormBody += '<span e-readonly="true">{{data.' + $scope.fields[key].name + '}}</span>';
                        } else {
                            HtmlFormBody += '<span editable-text="data.' + $scope.fields[key].name + '" e-name="' + $scope.fields[key].name + '" ng-model="' + $scope.fields[key].name + '">{{data.' + $scope.fields[key].name + '}}</span>';
                        }
                        break;
                }

                HtmlFormBody += '</p>';
            }

            HtmlFormBody += '<div class="buttons">';
            HtmlFormBody += '<button type="button" class="btn btn-default" ng-click="loadForm(editableForm)" ng-show="!editableForm.$visible">';
            HtmlFormBody += 'Editar';
            HtmlFormBody += '</button>';

            HtmlFormBody += '<span ng-show="editableForm.$visible">';
            HtmlFormBody += '<button type="submit" class="btn btn-primary" ng-disabled="editableForm.$waiting" style="margin-right:10px;">';
            HtmlFormBody += 'Salvar';
            HtmlFormBody += '</button>';

            HtmlFormBody += '<button type="button" class="btn btn-default" ng-disabled="editableForm.$waiting" ng-click="editableForm.$cancel()">';
            HtmlFormBody += 'Cancelar';
            HtmlFormBody += '</button>';
            HtmlFormBody += '</span>';
            HtmlFormBody += '</div>';
            HtmlFormBody += '</form>';

            $element.replaceWith($compile(HtmlFormBody)($scope));

        },
        controller: function ($scope, $element, $http, $location, $routeParams, $parse, $filter) {
            $scope.me = window.SAILS_LOCALS.me;
            $scope.combodata = ([]);
            $scope.combos = ([]);
            $scope.modelComboBox = ([]);
            $scope.sennitForm = {
                loading: false
            }
            $scope.inputClass = "";
            $scope.data = ({});
            $scope.url = ([]);

            $scope.loadForm = function (form) {
                form.$show();

                $(".datetimepicker").each(function (i, o) {
                    $scope.data[$(this).prop("name")] = getDateTimeString($scope.data[$(this).prop("name")]);
                });

                $('.datepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY', time: false });
                $('.datetimepicker').bootstrapMaterialDatePicker({ format: 'DD/MM/YYYY HH:mm' });
            };

            $scope.verifica = function (valor, nome, type, filtro) {
                if (valor.hasOwnProperty(nome)) {
                    for (key in valor) {

                        if (key == nome)
                            return valor[key];
                    }
                }

                if (type == "date" || type == "datepicker") {
                    return getDate(valor);
                }

                if (type == "datetimepicker") {
                    return getDateTimeString(valor);
                }

                if (type == "usuarios") {
                    return valor.name;
                }

                if (typeof valor === "boolean") {
                    if (valor == true) {
                        return "✔";
                    }
                    else {
                        return "✖";
                    }
                }

                if (filtro)
                    return $filter(filtro)(valor);
                else
                    return valor;
            }


            $scope.init = function () {
                $('input.materialize-textarea').characterCounter();
                for (var key in $scope.fields) {
                    // $scope.data[$scope.fields[key].name] ="";

                    switch ($scope.fields[key].type) {
                        case 'listview':
                            $scope.data[$scope.fields[key].model] = ([]);

                            break;
                        case 'textAngular':
                            $scope.data[$scope.fields[key].name] = "";
                            break;
                        case 'dataCriacao':
                            $scope.data[$scope.fields[key].name] = new Date();
                            break;


                        default:
                            break;
                    }
                }
            }

            $scope.change = function (model, data) {
                $scope.data[model] = data;
            }


            $scope.$on('handleBroadcast', function () {
                $scope.data = sennitCommunicationService.data;
                $scope.inputClass = "active";
            });


            $scope.save = function () {

                if ($scope.data.id) {
                    $scope.sennitForm.loading = true;

                    var params = {};
                    for (var field in $scope.fields) {
                        params[$scope.fields[field].name] = $scope.data[$scope.fields[field].name];
                    }

                    $(".datepicker").each(function (i, el) {
                        var value = $(this).val().split("/");
                        params[$(this).prop("name")] = new Date(value[2], parseInt(value[1]) - 1, value[0]);
                        $scope.data[$(this).prop("name")] = $(this).val();
                    });

                    $(".datetimepicker").each(function (i, el) {
                        params[$(this).prop("name")] = getDateTime($(this).val());
                        $scope.data[$(this).prop("name")] = $(this).val();
                    });

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
                                    url: '/' + $scope.listaname + '/' + $scope.data.id,
                                    data: params
                                }).then(function onSuccess(sailsResponse) {
                                    $scope.inputClass = null;
                                    $scope.inputClass = "disabled";
                                    swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                                    Materialize.toast('Registro alterado com sucesso!', 4000);
                                })
                                .catch(function onError(sailsResponse) {

                                })
                                .finally(function eitherWay() {
                                    $scope.sennitForm.loading = false;
                                })
                            } else {
                                swal("Cancelado", "Seu registro não foi alterado :(", "error");
                            }
                        }
                    );
                }
            };
        }
    }
}]);

