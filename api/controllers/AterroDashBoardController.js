/**
 * AterroDashboard
 *
 * @description :: Server-side logic for managing Aterroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    monitoramento: function (req, res) {
        if (!req.session.me) {
            return res.view('index');
        }

        return res.view('monitoramento');
    },

    _orderByDateDesc: function (a, b) {
        if (a.dataCriacao > b.dataCriacao)
            return -1;
        if (a.dataCriacao < b.dataCriacao)
            return 1;
        return 0;
    },

    _mustAdd: function (aterro) {

        if (aterro.dashboard.length == 0) {
            return false;
        }

        if (aterro.dashboard[0].habilitado == false) {
            return false;
        }

        return true;
    },

    list: function (req, res) {
        if (!req.session.me) {
            return res.view('index');
        }

        var _that = this;

        var _dashboards = [];
        var _totalDatasResult = 0;

        var filtro = {};
        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.id = req.session.me.aterro.id;
        }

        Aterro.find(filtro)
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
                    dataultimamedicao: new Date(),
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

                _dashboards.push(item);
            }

            var execute = new Promise(function (resolve, reject) {
                var totalItens = _dashboards.length;
                for (var i = 0; i < _dashboards.length; i++) {

                    var getLastDataMedicao = function (dashBoardIndex) {
                        var aterroId = _dashboards[dashBoardIndex].aterro.id;

                        MedicaoMarcoSuperficial.findOne({ aterro: aterroId }).sort("data DESC").exec(function (err, medicao) {
                            _totalDatasResult += 1;

                            var data = (medicao) ? new Date(medicao.data) : new Date();
                            _dashboards[dashBoardIndex].aterro.dataultimamedicao = data.getFullYear() + "-" + (data.getMonth()+1) + "-" + data.getDate();

                            if (_totalDatasResult == totalItens) {
                                return resolve(_dashboards);
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

    listall: function (req, res) {

        if (!req.session.me) {
            return res.view('index');
        }

        var _that = this;
        var _previews = [];
        var _totalDataConfigResult = 0;

        var filtro = {};
        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.id = req.session.me.aterro.id;
        }

        Aterro.find(filtro)
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
                    exibirmapahorizontal: false,
                    exibirmapavertical: false,
                    exibirlegenda: false,
                    fatorseguranca: '',
                    exibirfatorseguranca: false,
                    habilitado: false,
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

                _previews.push(item);
            }

            var execute = new Promise(function (resolve, reject) {
                var totalItens = _previews.length;
                for (var i = 0; i < _previews.length; i++) {

                    var getLastDataMedicao = function (dashBoardIndex) {
                        var aterroId = _previews[dashBoardIndex].id;

                        MedicaoMarcoSuperficial.findOne({ aterro: aterroId }).sort("data DESC").exec(function (err, medicao) {
                            _totalDataConfigResult += 1;

                            var data = (medicao) ? new Date(medicao.data) : new Date();
                            _previews[dashBoardIndex].dataultimamedicao = data.getFullYear() + "-" + (data.getMonth()+1) + "-" + data.getDate();

                            if (_totalDataConfigResult == totalItens) {
                                return resolve(_previews);
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

    search: function (req, res) {

        if (!req.session.me) {
            return res.view('index');
        }

        var filtro = {};

        for (key in req.allParams()) {
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        AterroDashboard.find(filtro)
        .populate('owner')
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    },

    searchCount: function (req, res) {

        if (!req.session.me) {
            return res.view('index');
        }

        var filtro = {};

        for (key in req.allParams()) {
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        AterroDashboard.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    }

}