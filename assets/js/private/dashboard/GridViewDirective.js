
    app.directive('gridView', [ '$compile','sennitCommunicationService', function ($compile,sennitCommunicationService) {
        return {
            restrict: 'E',
            scope: {
                filters: '=',
                fields: '=',
                listaname: '@',
                adicionar: '@',
                view: '@',
                strupdate: '@',
                update: '@',
                strdelete: '@',
                pagesize: '=',
                popup: '@',
                add: '@',
                edit: '@',
                delete: '@',
                autopage: '@',
                label: '@'

            }, link: function ($scope, $element, attrs) {
                var HtmlFormBody = "";

                HtmlFormBody += "<div class='card-panel'><h4 class='header2'>" + $scope.label + "</h4><div class='row' ng-init='init()'><a href='{{adicionar}}' ng-show='exibirAdd()' class='btn btn-labeled btn-primary'>Add New</a>";
                for (var key in $scope.fields) {
                    if ($scope.fields[key].filter == 'true') {  
                        $scope.habilitaBotao = true;                            
                        HtmlFormBody += "<div class='form-group col m2' id='sign-up-form'>";
                        HtmlFormBody += "<label ng-class='inputClass' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";                
                        HtmlFormBody += "<input type='text' class='form-control' id='" + $scope.fields[key].name + "' ng-model='querydapesquisa." + $scope.fields[key].name +".contains'>";
                        HtmlFormBody += "</div>";                     
                    }           
                }
                // <th style='width: 30px;'><input type='checkbox' value='true' data-bind='checked: selectAll' /></th> <td><input type='checkbox' /></td>
                HtmlFormBody += "<div ng-show='habilitaBotao' class='right col s1'><a ng-click='pesquisar()' class='btn-floating btn-small waves-effect waves-light'><i class='mdi-action-search'></i></a></div>";
                HtmlFormBody += "<table class='striped'><thead><tr>";
                HtmlFormBody += "<th ng-repeat='field in fields' class='text-center' id='Sistema.Id' style='cursor:pointer; text-align:center;'>{{field.value}}</th><th  ng-show='exibir("+$scope.strupdate+")' style='text-align:center;'>Editar</th><th  ng-show='exibir(update)' style='text-align:center;'>Ações</th><th  ng-show='exibir(\""+$scope.view + "\" == \"Relatorio\")' style='text-align:center;'>Ações</th></tr></thead>";
                HtmlFormBody += "<tbody><tr ng-repeat='datum in data' ng-click='ViewItem(datum)' style='cursor:pointer'><td ng-repeat='field in fields' style='text-align:center;' >";
                HtmlFormBody += "<span ng-repeat='(key, value) in datum ' ng-show='(key==field.name)' >{{ verifica(value,field.sub, field.type, field.uiFilter)}}</span></td><td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir("+$scope.strupdate+")' style='text-align:center;'><a ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(update)' style='text-align:center;'><a href='#/"+$scope.view+'/'+"{{datum.id}}' ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a> <a href='/visualizacao?id={{datum.id}}' target='_blank' ng-click='select(datum)'><i class='mdi-action-print  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;</td>";
                HtmlFormBody += "<td class='col-lg-3 col-md-4 col-sm-5 text-center'  ng-show='exibir(\""+$scope.view + "\" == \"Relatorio\")' style='text-align:center;'><a href='#/"+$scope.view+'/'+"{{datum.id}}' ng-click='select(datum)'><i class='mdi-image-edit  estre-darkgreen-icon small  icon-demo' aria-hidden='true'></i></a>&nbsp;&nbsp;&nbsp;&nbsp;</td>";
                HtmlFormBody += "</tr></tbody><tfoot>";
                HtmlFormBody += " <tr ng-hide='habilitaPaginacao'><td colspan='3' class='row'><div><ul class='pagination'><li><a href='' ng-click='(ActualPage == 1) || voltaUmaPagina(ActualPage)'>«</a></li><li ng-repeat='page in TotalPages' ><a href='' ng-click='Pagina(page)'>{{page}}</a></li><li><a href='' ng-click='(ActualPage == TotalPages.length) || avancaUmaPagina(ActualPage)'>»</a></li></ul></div></td><td><div class='row pull-right'><div class='input-field col s2'><a href='#/"+$scope.view+'/'+"new' ng-show='exibir(update)' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a></div></td></tr>";
                HtmlFormBody += "<tr ng-show='habilitaPaginacao'><td colspan='3' class='row'><div><ul class='pagination'><li><a>«</a></li><li ng-repeat='page in TotalPagesSearch' ><a href='' ng-click='PaginaSearch(page)'>{{page}}</a></li><li><a >»</a></li></ul></div></td><td><div class='row pull-right'><div class='input-field col s2'><a href='#/"+$scope.view+'/'+"new' ng-show='exibir(update)' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a></div></td></tr>";
                HtmlFormBody += "</tfoot></table></div></div>";
                if($scope.popup)
                HtmlFormBody +=  "<button ng-click='modalViewmodal()' class='btn btn-large ' aria-hidden='false'>Adicionar</button>"
                console.log(HtmlFormBody);
                // <a ng-show='deleteDisabled()'  ng-click='delete(datum)' aria-hidden='true'><i class='mdi-action-delete estre-darkgreen-icon  small icon-demo'></i></a>
                $element.replaceWith($compile(HtmlFormBody)($scope));

            },
            controller: function ($scope, $element, $http, $filter) {
                $scope.data = ([]);
                $scope.querydapesquisa = ({});
                $scope.me = window.SAILS_LOCALS.me;
                $scope.ActualPage = 1;
                $scope.skip = 0;
                $scope.TotalItens = 0;
                $scope.TotalPages = ([]);
                $scope.ActualPageSearch = 1;
                $scope.skipSearch = 0;
                $scope.TotalItensSearch = 0;
                $scope.TotalPagesSearch = ([]);

                for (var key in $scope.fields) {
                    if ($scope.fields[key].filter == 'true') {                        
                        $scope.querydapesquisa[$scope.fields[key].name] = {'contains': $scope[$scope.fields[key].name]};                        
                    }                         
                }
                $scope.pesquisar = function() {
                    $scope.querydapesquisa = JSON.stringify($scope.querydapesquisa);
                    $scope.refreshPageSearch();                                                       
                    $scope.habilitaPaginacao = true;
                };
                $scope.modalViewmodal = function()
                {
                    console.log('Marco');
                    $("#modalView").show();
                }

                 $scope.refreshPageSearch = function () {
                  $http.get('/'+ $scope.view +'?where='+$scope.querydapesquisa).then(function (results) {

                    $scope.TotalItensSearch = results.data.length;
                    var range = [];
                    var total = ($scope.TotalItensSearch / $scope.pagesize);
                    for (var i = 0; i < total; i++) {
                        range.push(i + 1);
                    }
                    console.log('range', range);
                    $scope.TotalPagesSearch = range;                        
                });

                $http.get('/'+ $scope.view +'?where='+$scope.querydapesquisa + "&skip="+  $scope.skipSearch  +"&limit="+ $scope.pagesize ).then(function(results) {
                    $scope.data = angular.fromJson(results.data);                    
                    $scope.querydapesquisa = JSON.parse($scope.querydapesquisa);
                });
                $scope.PaginaSearch = function (page) {
                    $scope.skipSearch = ((page - 1) * $scope.pagesize);
                    $scope.ActualPageSearch = page;
                    $scope.refreshPageSearch();
                };

                }; 
                $scope.exibir = function(value){                    
                    if(value == undefined || value == "false" || value == false)
                        return false;

                    return true;
                }

                $scope.exibirAdd = function(){

                    if($scope.add == "false")
                        return false;

                    return true;
                }
                 $scope.deleteDisabled = function(){
                       if ($scope.strdelete == 'false' )
                       return false

                       return true;
                };
     $scope.verifica = function (valor, nome, type, filtro) {        
        if(valor.hasOwnProperty(nome)) {

            for ( key in valor){

             if(key == nome)
                 return valor[key];
            }
        }
         if(type == "date"){

            var data = new Date(valor);
             var ano = data.getFullYear();
               var mes = data.getMonth() + 1;
               var dia = data.getDay();
             var retorno = dia + "/" + mes + "/" + ano;
            return retorno;
         }
        if(type == "usuario"){
            return valor.name;            
         }
         if(typeof valor === "boolean"){            
            if(valor == true) {
                return "✔";
            }
            else {
                return "✖";
            }
        }
         if(filtro)
            return $filter(filtro)(valor);
         else 
            return valor;
     }
                $scope.init = function () {




                    $scope.refreshPage();
                };

                     $scope.refreshPage = function () {
                  
                     $http.get("/"+ $scope.listaname + "/count" ).then(function (results) {

                        $scope.TotalItens = results.data.count;
                        var range = [];
                        var total = ($scope.TotalItens / $scope.pagesize);
                        for (var i = 0; i < total; i++) {
                            range.push(i + 1);
                        }
                        $scope.TotalPages = range;
                    });
                    console.log('Total de Registros: ' + $scope.TotalPages );
                    console.log('Pagina Atual: ' + $scope.ActualPage );
                    var query;
                    for (var key in $scope.fields) {
                        if (query)
                            query += $scope.fields[key].name + ',';
                        else
                            query = $scope.fields[key].name + ',';
                    }

                    if ($scope.fields.length)
                        query = query.substring(0, query.length - 1);

                    var plus = "";
                    if($scope.listaname.indexOf("?") < 0)    
                         plus +=   "?";
                    else
                        plus +=   "&";

                    $http.get("/"+ $scope.listaname + plus + "skip="+  $scope.skip  +"&limit="+ $scope.pagesize ).then(function(results) {
                        $scope.data = angular.fromJson(results.data);
                        console.log($scope.data );
                    });


                };

                $scope.Pagina = function (page) {
                    $scope.skip = ((page - 1) * $scope.pagesize);
                    $scope.ActualPage = page;
                    $scope.refreshPage();
                };
                $scope.voltaUmaPagina = function(page) {
                    var anterior = page - 1;
                    $scope.Pagina(anterior);
                };

                $scope.avancaUmaPagina = function(page) {
                    var posterior = page + 1;

                    $scope.Pagina(posterior);
                };
                $scope.$on('handleBroadcastItem', function() {
                    $scope.data.push(angular.fromJson(sennitCommunicationService.datum.data));
                    
                        $scope.refreshPage();
                    
                    console.log('Registro incluido com sucesso!');
                });       

                $scope.select = function(msg) {
                    console.log('mseg', msg);
                    sennitCommunicationService.prepForBroadcast(msg);
                };

                $scope.delete = function (item) {

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
                                $http.delete('/' + $scope.listaname +'/' + item.id )
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
    }]).directive('formView', [ '$compile','sennitCommunicationService', function  ($compile,sennitCommunicationService,$http) {
        return {
            restrict: 'E',
            scope: {
                fields: '=',
                datasource: '=',
                listaname: '@',
                strupdate: '@',
                strnew: '@',
                redirecionar: '@',  
                label: '@'


            }, link: function ($scope, $element, attrs, $http) {


                       

                var HtmlFormBody = " <div class='card-panel' ng-init='init()' ><h4 class='header2'>" + $scope.label + "</h4><div class='row'><form class='col s12'  ng-submit='save()' id='sign-up-form' >";
                console.log($scope.strupdate);
                if ($scope.strupdate == 'false')
                    HtmlFormBody += "";
                else
                    HtmlFormBody += "";
                for (var key in $scope.fields) {
                    console.log(key);
                    console.log($scope.fields[key].type);
                         switch ($scope.fields[key].type) {
                                 
                            case 'table-add-remove':
                                 
                                 //'tableadd': { 'model': 'usuarios' , 'text': 'name', 'valuesource': 'id' }
                                  if($scope.fields[key].tableadd)
                                  {
                                  HtmlFormBody += "<div class='form-group' >";
                                    HtmlFormBody += "<label for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                                    HtmlFormBody += "<select  id='" + $scope.fields[key].name + "'  class='form-control emailReminder width-169 ng-pristine ng-invalid ng-invalid-required ng-touched' ng-model='combodata." + $scope.fields[key].name + "' ng-options='x as x." + $scope.fields[key].tableadd.text + " for x in " + $scope.fields[key].tableadd.model + "' value=''></select>";
                                    HtmlFormBody += "</select>";
                                    HtmlFormBody += "<td class='col-lg-2 col-md-3 col-sm-4 text-center'>";
                                    HtmlFormBody += "<button type='button' class='mb-sm btn btn-labeled btn-primary' ng-click='Associate(combodata." + $scope.fields[key].name + ",&#39;" + $scope.fields[key].name  + "&#39;,&#39;" + $scope.fields[key].name  + "&#39; ,&#39;" + $scope.fields[key].tableadd.apiadd  + "&#39;, &#39;add&#39;)' aria-label='Left Align'>";
                                    HtmlFormBody += " Add <i class='fa fa-plus'></i>";
                                    HtmlFormBody += "</button>";
                                    HtmlFormBody += "</td>";
                                    HtmlFormBody += "</div>";
                                  
                                  }
                               
                                      
                                    HtmlFormBody += "<table class='table table-bordered table-hover'>";
                                    HtmlFormBody += "<thead class='thead-sennit'>";
                                    HtmlFormBody += "<tr>";
                                    HtmlFormBody += "<th class='col-lg-1 col-md-3 col-sm-3 text-center'>"+$scope.fields[key].name +"</th>";
                                    HtmlFormBody += "<th class='col-lg-2 col-md-3 col-sm-4 text-center'>Actions</th>";
                                    HtmlFormBody += "</tr>";
                                    HtmlFormBody += "</thead>";
                                    HtmlFormBody += "<tbody>";
                                    HtmlFormBody += "<tr data-ng-repeat='datum in data." + $scope.fields[key].name + "' class='ng-scope'>";
                                    HtmlFormBody += "<td class='col-lg-1 col-md-2 col-sm-3 ng-binding'>";
                                    HtmlFormBody += "{{datum." + $scope.fields[key].text + " }}";
                                    HtmlFormBody += "</td>";
                                    HtmlFormBody += "<td class='col-lg-2 col-md-3 col-sm-4 text-center'>";
                                    HtmlFormBody += "<button type='button' class='mb-sm btn btn-danger' ng-click='Associate(datum, &#39;" + $scope.fields[key].name + "&#39;,&#39;" + $scope.fields[key].tableadd.valuesource  + "&#39; ,&#39;" + $scope.fields[key].tableadd.apidelete  + "&#39;, &#39;delete&#39;)' aria-label='Left Align'>";
                                    HtmlFormBody += " <i class='fa fa-trash' aria-hidden='true'></i>";
                                    HtmlFormBody += "</button>";
                                    HtmlFormBody += "</td>";
                                    HtmlFormBody += "</tr>";
                                    HtmlFormBody += "</tbody>";
                                    HtmlFormBody += "</table>";
                                 
                                 
                                 break;
                            case 'listbox-multiple':
                                
                                    HtmlFormBody += "<div class='form-group'>";
                                    HtmlFormBody += "<label for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";
                                    HtmlFormBody += "<select multiple id='" + $scope.fields[key].name + "' required ng-multiple='true' class='form-control emailReminder width-169 ng-pristine ng-invalid ng-invalid-required ng-touched' ng-model='data." + $scope.fields[key].name + "' ng-options='x as x." + $scope.fields[key].text + " for x in " + $scope.fields[key].model + "' value=''></select>";
                                    HtmlFormBody += "</select>";
                                    HtmlFormBody += "</div>";
                                break;

                            case 'listview' :
                                HtmlFormBody += "<div class='row'><div class='input-field col s12'> ";
                                HtmlFormBody += "<label  ng-class='inputClass' for='"+$scope.fields[key].name+"'>" + $scope.fields[key].value + "</label>";                                    
                                HtmlFormBody += "<input class='col s11' type='text' ng-model='" + $scope.fields[key].input + "' ></input>";
                                HtmlFormBody += "<div class='col s1'><a ng-click='adicionaAlertas(" + $scope.fields[key].input + ",\"" + $scope.fields[key].model.trim()  + "\",\"" + $scope.fields[key].input + "\" )' class='btn-floating btn-small waves-effect waves-light' aria-hidden='false'><i class='mdi-content-add'></i></a></div>";
                                HtmlFormBody += "<table class='striped col s11'><thead><tr>";                               
                                HtmlFormBody += "<th ng-repeat='field in fields[" + key + "].fields' class='text-center' id='Sistema.Id' style='cursor:pointer'>{{field.value}}</th></tr></thead>";
                                HtmlFormBody += "<tbody><tr ng-repeat='datum in data."+$scope.fields[key].model+"' ng-click='ViewItem(datum)' style='cursor:pointer'><td</td><td ng-repeat='field in fields[" + key + "].fields' >";
                                HtmlFormBody += "<span ng-repeat='(key, value) in datum ' ng-show='(key==field.name)'>{{ verifica(value,field.name)}}</span></td>";
                                HtmlFormBody += "</tr></tbody></table>";
                                HtmlFormBody += "</div></div>";
                                // ng-show='exibir(strupdate)' td de delete
                                // ng-show='deleteDisabled()' <A> tag
                                break;
                            case 'checkbox':
                                HtmlFormBody += "<div class='row'><div class='collection-item dismissable'><div class='input-field col s12'><input type='checkbox'  ng-model='data." + $scope.fields[key].name + "'  id='"+  $scope.fields[key].name +"' /><label for='" + $scope.fields[key].name + "' >" + $scope.fields[key].value + "</label></div></div></div>";

                                break;
                            case 'textAngular':
                                HtmlFormBody += "<div class='row'><div class='collection-item dismissable'><div class='input-field col s12'><label for='" + $scope.fields[key].name + "' >" + $scope.fields[key].value + "</label><br><br><div class='row'><div class='col s12'><div text-angular ng-change='change(\"" + $scope.fields[key].name + "\","+$scope.fields[key].name+")' ng-model='"+$scope.fields[key].name+"'></div></div></div></div></div></div>";
                                break;                                                        
                            case 'combobox':
                                    $scope.getCombo($scope.fields[key]);
                                    HtmlFormBody += "<div class='row'><div class='input-field col s12'>";
                                    HtmlFormBody += "<label class='active' for='" + $scope.fields[key].name + "'>" + $scope.fields[key].value + "</label>";                                    
                                    HtmlFormBody += "<select class='browser-default active' id='" + $scope.fields[key].name + "' required ng-model='data." + $scope.fields[key].name + "' ng-options='x as x." + $scope.fields[key].fieldname + " for x in " + $scope.fields[key].model + " track by x." + $scope.fields[key].fieldid + "'></select>";
                                    HtmlFormBody += "</div></div>";
                                break;
                            default:
                                HtmlFormBody += "<div class='row'><div class='input-field col s12'><input type='text' ng-model='data." + $scope.fields[key].name + "' "+$scope.fields[key].uiMask+"></input><label  ng-class='inputClass'   for='" + $scope.fields[key].name + " '>" + $scope.fields[key].value + "</label></div></div>";
                                break;
                         }           

                } 

     
                    HtmlFormBody +=  "<div class='row'>&nbsp;</div><div class='row'><div class='input-field col s12'><a ng-click='newitem()' ng-show='newDisabled()' class='btn-floating btn-large waves-effect waves-light'><i class='mdi-content-add'></i></a><button ng-show='verificaBotaoSubmit()' type='submit' class='btn cyan waves-effect waves-light right' ><span ng-show='!sennitForm.loading'>Submeter</span>";
                    HtmlFormBody += "<span class='overlord-loading-spinner fa fa-spinner' ng-show='sennitForm.loading' ></span>";
                    HtmlFormBody +="<span ng-show='sennitForm.loading'>Aguarde...</span></button></div></div>";
            

                    HtmlFormBody += "</div></div></div> <input type='hidden' name='_csrf' value='<%= _csrf %>' /></form></div>";
                    console.log(HtmlFormBody);

                    $element.replaceWith($compile(HtmlFormBody)($scope));
                
            },
            controller: function ($scope, $element, $http, $location, $routeParams, $parse) {
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

                $scope.verifica = function (valor, nome, type) {
                    if(valor.hasOwnProperty(nome)) {
                        for ( key in valor){
                            if(key == nome)
                                return valor[key];
                        }
                    }
                    if(nome == "date"){
                        var data = new Date(valor);
                        var ano = data.getFullYear();
                        var mes = data.getMonth() + 1;
                        var dia = data.getDate();
                        var retorno = dia + "/" + mes + "/" + ano;
                        return retorno;
                    }
                    return valor;
                }
                
                $scope.getCombo = function(field) {                    
                    $http.get("/"+ field.api).then(function (results) {                                
                        $scope[field.model]  = results.data;                          
                    });
                };

                $scope.init = function(){
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
                            /*case 'combobox':                                
                                
                                $http.get("/"+ $scope.fields[key].api).then(function (results) {                                
                                    $scope[$scope.fields[key].model]  = results.data;  
                                    console.log("combo, combo", $scope[$scope.fields[key].model]);
                                });

                                break;*/
                            default:
                        
                            break;
                        }
                    } 
                }
                
                $scope.adicionaAlertas = function(coeficiente, model, input) {
                    var date = new Date();
                    var dateISO = date.toISOString();
                    $scope.data[model].push({'coeficienteRU': coeficiente, 'date': dateISO});
                    $scope[input] = "";           
                };
                $scope.change = function(model, data) {
                    console.log('model = ', model, "data = ", data);
                    $scope.data[model] = data;
                }
/*                $scope.changeCombo = function (data, combo) {                
                    $scope.data[data] = combo;                                    
                                   
                };*/
                $scope.newitem = function () {                    
                    $scope.data = ([]);
                    var newData = ({});
                    for (var key in $scope.fields) {
/*                        if($scope.fields[key].input)
                            $scope.fields[key].input = "";*/

                        if($scope.fields[key].model)
                            newData[$scope.fields[key].name] = ([]);
                        else  
                            newData[$scope.fields[key].name] = "";
                            $scope[$scope.fields[key].name] = "";          
                    }                    
                    $scope.data = newData;
                    $scope.inputClass = "disabled";
                };

                $scope.$on('handleBroadcast', function() {
                    $scope.data = sennitCommunicationService.data;
                    $scope.inputClass = "active";
                    console.log('Mudou aqui');
                });        


                $scope.Associate = function (value, model,id, api, type) {
                  
                    var idAssossiate = "id";
                    var dataAssossiate = '{ "'+ id + '": "' + value[idAssossiate]+ '" , "id": "'+ $routeParams.id + '"}';     
                    console.log(model);
                    $http.post('/' + api , dataAssossiate)
                        .then(function (project) {
                            if(type == "add")
                                $scope.data[model].push(value);
                            else
                                $scope.data[model].splice ($scope.getResourceIndex($scope.data[model], value),1);
                    });
                };
                $scope.newDisabled = function(){
                       if ($scope.strnew == 'false' )
                       return false

                       return true;
                };

               
                $scope.verificaBotaoSubmit = function(){
                    console.log(typeof $scope.data.id ); 
                        if ($scope.strnew == 'false' && typeof $scope.data.id == "undefined")
                            return false;
                   
                        console.log('True');
                        return true;
                };
                
                
                $scope.getResourceIndex = function(resources, resource) {
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
                  if($scope.data.id){
                    console.log('data update', $scope.data)
                    /* var query = $.param($scope.data);

                    for (var key in $scope.data) {
                        if (key != "$$hashKey"){
                            if (query){
                                if(!Array.isArray($scope.data[key]))
                                    query += "&" + key + "="+ $scope.data[key];

                            } else {
                                if(!Array.isArray($scope.data[key]))
                                    query = "" + key + "="+ $scope.data[key];                                
                            } 
                        }              
                    }
                    var inJson = angular.toJson( $scope.data);
                    query = JSON.parse(inJson);
                    $scope.sennitForm.loading = true;*/
        			$scope.sennitForm.loading = true;
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
                                        url: '/'+ $scope.listaname + '/' + $scope.data.id,
                                        data: $scope.data
                                    }).then(function onSuccess(sailsResponse){
                                        $scope.inputClass = null;
                                        //sennitCommunicationService.prepForBroadcastDataList($scope.data);
                                        $scope.data = ([]);
                                        $scope.inputClass = "disabled";
                                        swal("Registro Alterado!", "Seu registro foi alterado com sucesso.", "success");
                                        Materialize.toast('Registro alterado com sucesso!', 4000);
                                    })
                                    .catch(function onError(sailsResponse){

                                    })
                                    .finally(function eitherWay(){
                                        $scope.sennitForm.loading = false;
                                    })
                                    $scope.newitem();
                                } else {
                                    swal("Cancelado", "Seu registro não foi alterado :(", "error");
                                } 
                            }
                        );                                            


            		} else{
/*                        var query;
                        for (var key in $scope.data) {

                            console.log(  );
                            console.log($scope.data[key]);
                            if (query){
                                if(Array.isArray($scope.data[key]))
                                {
                                     var loopVerify;
                                for (var keyModel in $scope.data[key]) {
                                    console.log($scope.data[key]);
                                 if(loopVerify){
                                      loopVerify = "passou";
                                    
                                     query += ', "'+ $scope.data[key][keyModel].id  + '"';
                                             
                                 }else{
                                     loopVerify = "passou";
                                     query += ',"' + key + '":  "'+ $scope.data[key][keyModel].id + '"';
                                      
                                     
                                 }

                                }
                                  query +=  "]";
                                }else{
                                    if($scope.data[key])
                                    {
                                        query += ',"' + key + '": "'+ $scope.data[key] + '"';
                                    }else{

                                        query += "," + key + "="+ $scope.data[key];
                                    }
                                
                                }

                            } else{
                                if(Array.isArray($scope.data[key]))
                                {
                                    var loopVerify;
                                    for (var keyModel in $scope.data[key]) {
                                        console.log($scope.data[key]);
                                     if(loopVerify){
                                          loopVerify = "passou";
                                    
                                          query += ',  "'+ $scope.data[key][keyModel].id + '"';       
                                     }else{
                                         loopVerify = "passou";
                                  
                                          query = '{"' + key + '":  "'+ $scope.data[key][keyModel].id + '"';
                                         
                                     }

                                    }
                                      query +=  "]";
                                    }else{
                                    query = '{ "' + key + '": "'+ $scope.data[key] + '"';
                                    }
                                }
                                
                        }

                        query += "}"; */                       

                        swal({   title: "",   
                            text: "Você tem certeza que deseja incluir este registro?",   
                            type: "info",   
                            showCancelButton: true, 
                            confirmButtonText: "Sim",   
                            cancelButtonText: "Cancelar",   
                            closeOnConfirm: false,   
                            closeOnCancel: false }, 
                            function(isConfirm){   
                                if (isConfirm) {     
                                    swal("Registro Incluido!", "Seu registro foi incluido com sucesso.", "success");
                                    var inJson = angular.toJson( $scope.data);
                                    query = JSON.parse(inJson);
                                    console.log('query1', query);


                                    $http.post('/'+ $scope.listaname , query)
                                    .then(function onSuccess(sailsResponse){
                                        Materialize.toast('Registro incluido com sucesso!', 4000);
                                        sennitCommunicationService.prepForBroadcastDataList(sailsResponse);
                                        $scope.newitem();
                                        $scope.sennitForm.loading = false;

                                    })
                                    .catch(function onError(sailsResponse){



                                    })
                                    .finally(function eitherWay(){
                                        $scope.sennitForm.loading = false;
                                    })
                                } else {
                                    swal("Cancelado", "Seu registro não foi salvo :(", "error");   
                                } 
                            }
                        );                        

                    }
                };
            }

        }
            }]).factory('sennitCommunicationService', function($rootScope) {
            var sennitCommunicationService = ([]);
            
            sennitCommunicationService.data = '';

            sennitCommunicationService.prepForBroadcast = function(data) {
                this.data = data;
                this.broadcastItem();
            };

            sennitCommunicationService.prepForBroadcastDataList = function(datum) {
                this.datum = datum;
                this.broadcastItemReturn();
            };

            

            sennitCommunicationService.broadcastItem = function() {
                $rootScope.$broadcast('handleBroadcast');
            };

            sennitCommunicationService.broadcastItemReturn = function() {
                $rootScope.$broadcast('handleBroadcastItem');
            };

    return sennitCommunicationService;
}).directive('myIframe', function(){
    var linkFn = function(scope, element, attrs) {
        element.find('iframe').bind('load', function (event) {
          event.target.contentWindow.scrollTo(0,400);
        });
    };
    return {
      restrict: 'EA',
      scope: {
        src:'&src',
        height: '@height',
        width: '@width',
        scrolling: '@scrolling'
      },
      template: '<iframe class="frame" height="{{height}}" width="{{width}}" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="{{scrolling}}" src="{{src()}}"></iframe>',
      link : linkFn
    };
  });;