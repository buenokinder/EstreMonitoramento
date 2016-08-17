/**
 * FatorSegurancaController
 *
 * @description :: Server-side logic for managing Fatorsegurancas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	search: function(req, res) {
		var filtro = {};

		for(key in req.allParams()) {
			if(key == 'nome') {
				filtro.nome = { 'contains': req.param('nome') };
				continue;
			}
	if(key == 'ano') {
				filtro.ano = { 'contains': req.param('ano') };
				continue;
			}
				if(key == 'mes') {
				filtro.mes =  { 'contains': req.param('mes') };
				continue;
			}

			if(req.param(key) == undefined) continue;
			filtro[key] = req.param(key);
		}
console.log(filtro);
		FatorSeguranca.find(filtro)
		.populate('aterro')
		.populate('secao')
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
		
		FatorSeguranca.count(filtro)
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});		
	}
};


