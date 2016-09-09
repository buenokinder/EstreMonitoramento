/**
 * AterroController
 *
 * @description :: Server-side logic for managing Aterroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {

    findOne: function (req, res) {

        Aterro.find({ id: req.param('id') }).populate("usuarios")
        .exec(function (err, goal) {
            if (err) return res.json(err, 400);
            return res.json(goal[0]);
        });
    },


    _orderByDateDesc: function (a, b) {
        if (a.dataCriacao > b.dataCriacao)
            return -1;
        if (a.dataCriacao < b.dataCriacao)
            return 1;
        return 0;
    },

    _totalDatasResult: 0,
    _totalDataConfigResult: 0,

    _mustAdd: function(aterro){
        
        if (aterro.dashboard.length == 0) {
            return false;
        }

        if (aterro.dashboard[0].habilitado == false) {
            return false;
        }

        return true;
    },

    _dashboards: [],
    _previews: [],

    dashboard:function(req, res){
        var _that = this;
        _that._dashboards = [];
        _that._totalDatasResult = 0;

        Aterro.find({})
            .populate("mapa")
            .populate("dashboard")
        .exec(function (err, aterros) {
            if (err) {
                return res.negotiate(err);
            }

            for (var i = 0; i < aterros.length; i++) {
                var aterro = aterros[i];

                if (!_that._mustAdd(aterro)) {
                    continue;
                }

                if (aterro.mapa.length > 1) {
                    aterro.mapa.sort(_that._orderByDateDesc);
                }

                var item = {};
                item.aterro = {
                    id: aterro.id,
                    nome: aterro.nome,
                    cidade: aterro.cidade,
                    endereco: aterro.endereco,
                    telefone: aterro.telefone,
                    dataultimamedicao: 1,
                    mapaFile: aterro.mapa.length > 0 ? aterro.mapa[0].mapaFile : ''
                };

                var dash = aterro.dashboard[0];

                item.config = {

                    exibirmapahorizontal: dash.exibirmapahorizontal,
                    exibirmapavertical: dash.exibirmapavertical,
                    exibirlegenda: dash.exibirlegenda,
                    fatorseguranca: dash.fatorsegurancao,
                    exibirfatorseguranca: dash.exibirfatorseguranca,
                    imagemfatorseguranca: dash.imagemfatorseguranca
                };

                _that._dashboards.push(item);
            }

            var execute = new Promise(function (resolve, reject) {
                var totalItens = _that._dashboards.length;
                for (var i = 0; i < _that._dashboards.length; i++) {

                    var getLastDataMedicao = function (dashBoardIndex) {
                        var aterroId = _that._dashboards[dashBoardIndex].aterro.id;

                        MedicaoMarcoSuperficial.findOne({ aterro: aterroId }).sort("data DESC").exec(function (err, medicao) {
                            _that._totalDatasResult += 1;

                            var data = (medicao) ? new Date(medicao.data) : new Date();
                            _that._dashboards[dashBoardIndex].aterro.dataultimamedicao = data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate();

                            if (_that._totalDatasResult == totalItens) {
                                return resolve(_that._dashboards);
                            }
                        });
                    };

                    getLastDataMedicao(i);
                }
            });

            execute.then(function (ret) {
                return res.json(ret);
            });
        });

    },

    dashboardConfig: function (req, res) {
        var _that = this;
        _that._previews = [];
        _that._totalDataConfigResult = 0;

        Aterro.find({})
            .populate("mapa")
            .populate("dashboard")
        .exec(function (err, aterros) {
            if (err) {
                return res.negotiate(err);
            }

            for (var i = 0; i < aterros.length; i++) {
                var aterro = aterros[i];

                if (aterro.mapa.length > 1) {
                    aterro.mapa.sort(_that._orderByDateDesc);
                }

                var item = {
                    id: aterro.id,
                    nome: aterro.nome,
                    cidade: aterro.cidade,
                    endereco: aterro.endereco,
                    telefone: aterro.telefone,
                    dataultimamedicao: new Date(),
                    mapaFile: aterro.mapa.length > 0 ? aterro.mapa[0].mapaFile : '',
                    imagemfatorseguranca: '',
                    exibirmapahorizontal:false,
                    exibirmapavertical:false,
                    exibirlegenda:false,
                    fatorseguranca:'',
                    exibirfatorseguranca:false,
                    habilitado:false,
                };

                if (aterro.dashboard.length > 0) {
                    var dash = aterro.dashboard[0];
                    item.imagemfatorseguranca = dash.imagemfatorseguranca;
                    item.exibirmapahorizontal = dash.exibirmapahorizontal;
                    item.exibirmapavertical = dash.exibirmapavertical;
                    item.exibirlegenda = dash.exibirlegenda;
                    item.fatorseguranca = dash.fatorseguranca;
                    item.exibirfatorseguranca = dash.exibirfatorseguranca;
                    item.habilitado = dash.habilitado;
                }

                _that._previews.push(item);
            }

            var execute = new Promise(function (resolve, reject) {
                var totalItens = _that._previews.length;
                for (var i = 0; i < _that._previews.length; i++) {

                    var getLastDataMedicao = function (dashBoardIndex) {
                        var aterroId = _that._previews[dashBoardIndex].id;

                        MedicaoMarcoSuperficial.findOne({ aterro: aterroId }).sort("data DESC").exec(function (err, medicao) {
                            _that._totalDataConfigResult += 1;

                            var data = (medicao) ? new Date(medicao.data) : new Date();
                            _that._previews[dashBoardIndex].dataultimamedicao = data.getFullYear() + "-" + data.getMonth() + "-" + data.getDate();

                            if (_that._totalDataConfigResult == totalItens) {
                                return resolve(_that._previews);
                            }
                        });
                    };

                    getLastDataMedicao(i);
                }
            });

            execute.then(function (ret) {
                return res.json(ret);
            });
        });

    },


    //teste: function (req, res) {

    //    console.log("JSON File:");
    //    var JsonConvert = require("./JPN.geo.json");

    //    var UtmConverter = require('utm-converter'); // Example using Node.js.
    //    var converter = new UtmConverter();
    //    var wgsResult;
    //    for (var prop in JsonConvert) {
    //        if (JsonConvert.hasOwnProperty(prop)) {
    //            console.log(prop);
    //            switch (prop) {

    //                case "geometries":
    //                    var geometries = JsonConvert[prop];

    //                    for (var teste in geometries) {



    //                        for (i = 0; i < geometries[teste].coordinates.length; i++) {
    //                            console.log("teste: " + geometries[teste].coordinates[i][0]);
    //                            wgsResult = converter.toWgs({ "coord": { "x": geometries[teste].coordinates[i][0], "y": geometries[teste].coordinates[i][1] }, "zone": 22, "isSouthern": true });
    //                            geometries[teste].coordinates[i][0] = wgsResult.coord.longitude;
    //                            geometries[teste].coordinates[i][1] = wgsResult.coord.latitude;
    //                        }



    //                    }

    //                    break;
    //                    // obj[prop] has the value
    //            }
    //        }
    //    }

    //    // var wgsCoord = [145.240917, -37.830436];

    //    // var utmResult =[666179.596719106,7161622.580844007,0,-1e+38];//{"coord":{"x":665832.645,"y":7162140.815},"zone":24,"isSouthern":true};
    //    // // 

    //    // var wgsResult = converter.toWgs(utmResult);
    //    require('fs').writeFile(
    //        './my.json',
    //        JSON.stringify(JsonConvert),
    //        function (err) {
    //            if (err) {
    //                console.error('Crap happens');
    //            }
    //        }
    //    );
    //    // console.log(wgsResult);
    //    // // {"coord":{"longitude":145.24091699999727,"latitude":-37.83043599999867}}
    //    return res.json(JsonConvert);
    //},

    findAll: function (req, res) {
        Aterro.find()
        .populate("usuarios")
        .populate("mapa")
        .populate("dashboard")
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    },

    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if (key == 'cidade') {
                filtro.cidade = { 'contains': req.param('cidade') };
                continue;
            }

            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {

            filtro.id = req.session.me.aterro.id;
        }

        Aterro.find(filtro).populate("usuarios")
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    },

    searchCount: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.id = req.session.me.aterro.id;
        }

        Aterro.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    }
}