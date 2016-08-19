/**
 * OperacaoSecaoCorteController
 *
 * @description :: Server-side logic for managing Operacaosecaocortes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
search: function(req, res) {
		var filtro = {};

		for(key in req.allParams()) {
		
	if(key == 'datainicial') {
				filtro.dataMedicao = { '>': new Date(req.param('datainicial') ) , '<': new Date(req.param('datafinal')) } ;
				continue;
			}
			
				if(key == 'datafinal') {
				continue;
			}

			if(req.param(key) == undefined) continue;
			filtro[key] = req.param(key);
		}
console.log(filtro);

		OperacaoSecaoCorte.find(filtro)
		.populate('aterro')
		.populate('usuario')
        .populate('secaoCorte')
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});
	},

	searchCount: function(req, res) {
		var filtro = {};
		
		for(key in req.allParams()) {
			if(key == 'nome') {
				filtro.nome = { 'contains': req.param('nome') };
				continue;
			}
			if(req.param(key) == undefined) continue;
			filtro[key] = req.param(key);
		}
		
		OperacaoSecaoCorte.count(filtro)
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});		
	}
};

