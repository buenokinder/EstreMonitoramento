/**
 * SecaoFatorSegurancaController
 *
 * @description :: Server-side logic for managing Secaofatorsegurancas
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


		SecaoFatorSeguranca.find(filtro)
		.populate('usuario')
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});
	},

	relatorio: function (req, res) {
	    var filtro = {};
	    var filtroFatorSeguranca = { mesInicial: undefined, mesFinal: undefined, anoInicial: undefined, anoFinal: undefined };
	    var filtroPorPeriodo = false;

	    for (key in req.allParams()) {
	        if (key == 'nome') {
	            filtro.nome = { 'contains': req.param('nome') };
	            continue;
	        }

	        if (key == 'dtIni' || key == 'dtFim') {
	            if (filtroPorPeriodo == true) continue;

	            filtroFatorSeguranca.mesInicial = parseInt(req.param('dtIni').split('-')[1]);
	            filtroFatorSeguranca.mesFinal = parseInt(req.param('dtFim').split('-')[1]);

	            filtroFatorSeguranca.anoInicial = parseInt(req.param('dtIni').split('-')[0]);
	            filtroFatorSeguranca.anoFinal = parseInt(req.param('dtFim').split('-')[0]);
	            filtroPorPeriodo = true;
	            continue;
	        }

	        if (req.param(key) == undefined) continue;
	        filtro[key] = req.param(key);
	    }

	    //if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
	    //    filtro.aterro = req.session.me.aterro.id;
	        
	    //}

	    SecaoFatorSeguranca.find({ where: filtro })
		.populate('fatorSeguranca')
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        if (filtroPorPeriodo==true) {
		            var result = [];

		            for (var i = 0; i < ret.length; i++) {
		                var secaoFatorSeguranca = ret[i];
		                var secaoFatorResult = { id: secaoFatorSeguranca.id, nome: secaoFatorSeguranca.nome, aterro: secaoFatorSeguranca.aterro, fatorSeguranca: [] };

		                for (var j = 0; j < secaoFatorSeguranca.fatorSeguranca.length; j++) {
		                    var fatorSeguranca = ret[i].fatorSeguranca[j];
		                    if (fatorSeguranca.mesSearch < filtroFatorSeguranca.mesInicial || fatorSeguranca.mesSearch > filtroFatorSeguranca.mesFinal) continue;
		                    if (fatorSeguranca.ano < filtroFatorSeguranca.anoInicial || fatorSeguranca.ano > filtroFatorSeguranca.anoFinal) continue;

		                    secaoFatorResult.fatorSeguranca.push({ saturacao: fatorSeguranca.saturacao, mes: fatorSeguranca.mes, ano: fatorSeguranca.ano, valorRu: fatorSeguranca.valorRu, valorLp: fatorSeguranca.valorLp });
		                }

		                result.push(secaoFatorResult);
		            }

		            res.json(result);
		        } else {
		            res.json(ret);
		        }

		        
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

		//if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
		//    filtro.aterro = req.session.me.aterro.id;
		//}

		
		SecaoFatorSeguranca.count(filtro)
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});		
	}
};


