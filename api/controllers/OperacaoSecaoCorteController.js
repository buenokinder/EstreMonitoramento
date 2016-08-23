/**
 * OperacaoSecaoCorteController
 *
 * @description :: Server-side logic for managing Operacaosecaocortes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    search: function (req, res) {
        var filtro = {};

        if (undefined!=req.param('datainicial') && undefined==req.param('datafinal')) {
            filtro.dataMedicao = { '>=': new Date(req.param('datainicial')) };
        }

        if (undefined!=req.param('datafinal') && undefined==req.param('datainicial')) {
            filtro.dataMedicao = { '<=': new Date(req.param('datainicial')) };
        }

        if (undefined!=req.param('datainicial') && undefined!=req.param('datafinal')) {
            filtro.dataMedicao = { '>=': new Date(req.param('datainicial')), '<=': new Date(req.param('datafinal')) };
        }

        for (key in req.allParams()) {
            if (key == 'datafinal' || key == 'datainicial') {
                continue;
            }

            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }
        console.log("filtro", filtro);

        OperacaoSecaoCorte.find(filtro)
		.populate('aterro')
		.populate('usuario')
        .populate('secaoCorte')
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

        OperacaoSecaoCorte.count(filtro)
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        res.json(ret);
		    }
		});
    }
};

