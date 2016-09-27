/**
 * FatorSegurancaController
 *
 * @description :: Server-side logic for managing Fatorsegurancas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    search: function (req, res) {
        var filtro = {};
        var filtroMes = false;
        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if (key == 'ano') {
                filtro.ano = { 'contains': req.param('ano') };
                continue;
            }
            if (key == 'mes') {
                filtro.mes = { 'contains': req.param('mes') };
                continue;
            }

            if (key == 'dtIni' || key == 'dtFim') {

                if (filtroMes) continue;

                var mesInicial = parseInt(req.param('dtIni').split('-')[1]);
                var mesFinal = parseInt(req.param('dtFim').split('-')[1]);

                var anoInicial = parseInt(req.param('dtIni').split('-')[0]);
                var anoFinal = parseInt(req.param('dtFim').split('-')[0]);

                filtro.mesSearch = { '>=': mesInicial, '<=': mesFinal };
                filtro.ano = { '>=': anoInicial, '<=': anoFinal };

                filtroMes = true;
                continue;
            }

            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }

        FatorSeguranca.find({ where: filtro })
		.populate('aterro')
		.populate('secao')
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

            filtro.aterro = req.session.me.aterro.id;
        }

        FatorSeguranca.count(filtro)
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        res.json(ret);
		    }
		});
    }
};


