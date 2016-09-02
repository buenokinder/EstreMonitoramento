/**
 * PocosVisitaController
 *
 * @description :: Server-side logic for managing Pocosvisitas
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
			if(req.param(key) == undefined) continue;
			filtro[key] = req.param(key);
		}

		if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
		    filtro.aterro = req.session.me.aterro.id;
		}

		PocosVisita.find(filtro)
		.populate('aterro')
		.populate('usuario')
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
		
		if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
		    filtro.aterro = req.session.me.aterro.id;
		}

		PocosVisita.count(filtro)
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});		
	}
};


