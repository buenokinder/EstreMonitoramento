/**
 * MarcoSuperficialController
 *
 * @description :: Server-side logic for managing Marcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {
	

	listCalculado: function(req, res){

		var execute = new Promise( function( resolve, reject )
	    {
			var total=0;
			var totalCarregados=0;

			MarcoSuperficial.find({})
			.populate('aterro')
			.exec(function result(err, marcosSuperficiais) {
				total = marcosSuperficiais.length;

				var endLoadDetalhe = function(marcosSuperficiais, index, detalhes){
					marcosSuperficiais[index].medicaoMarcoSuperficialDetalhes = detalhes;
					totalCarregados+=1;
					if(total==totalCarregados){

						for(var i=0;i<marcosSuperficiais.length;i++){

						    var retorno = {
						        deslocamentoHorizontalParcial: [],
						        deslocamentoHorizontalTotal: ([]),
						        velocidadeHorizontal: ([]),
						        velocidadeVertical: ([]),
						        criterioAlerta: Math.pow(2, 2)
						    };

							var MedicaoInicial = marcosSuperficiais[i];
							MedicaoInicial.data = MedicaoInicial.createdAt;

							for(var j=0;j<marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length;j++){

								var MedicaoAtual = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j];
								var MedicaoAnterior = j==0?MedicaoInicial:marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j-1];

								var deltaParcialNorte = Math.pow((MedicaoAtual.norte - MedicaoAnterior.norte), 2);
								var deltaParcialEste = Math.pow((MedicaoAtual.leste - MedicaoAnterior.leste), 2);
								var deltaTotalNorte = Math.pow((MedicaoAtual.norte - MedicaoInicial.norte), 2);
								var deltaTotalEste = Math.pow((MedicaoAtual.leste - MedicaoInicial.leste), 2);

								retorno.deslocamentoHorizontalParcial.push(deltaParcialNorte);
								retorno.deslocamentoHorizontalParcial.push(deltaParcialNorte);
					            /*DataAtual = Math.floor(MedicaoAtual.data.getTime() / (3600 *24 *1000));
					            DataAnterior = Math.floor(MedicaoAnterior.data.getTime() / (3600*24*1000));
					            DiferencaDatas = DataAtual - DataAnterior;
								*/


							}

							marcosSuperficiais[i].deslocamentos=retorno;

						}


						return resolve(marcosSuperficiais);
					}					
				};

				var initLoadDetalhe = function(index){
					marcosSuperficiais[index].loadDetalhes(endLoadDetalhe, marcosSuperficiais, index);
				};

				for(var index=0;index<marcosSuperficiais.length;index++){
					initLoadDetalhe(index);
				}
			});

	    });

		execute.then(function(results){
		    res.json(results);
		})

/*

var total=0;
		var totalCarregados=0;
		var retorno =([]);
		MarcoSuperficial.find({})
			.populate('aterro')
			.exec(function result(err, ret) {
				total = ret.length;

				var endLoadDetalhe = function(ret, indexDetalhe, result){
					ret[indexDetalhe].medicaoMarcoSuperficialDetalhes = result;
					totalCarregados+=1;
					if(total==totalCarregados){
						res.json(ret);		
					}					
				};

				var initLoadDetalhe = function(indexDetalhe){
					ret[indexDetalhe].loadDetalhes(endLoadDetalhe, ret, indexDetalhe);
				};

				for(var i=0;i<ret.length;i++){
					initLoadDetalhe(i);
				}
			});

			*/
	},

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

		MarcoSuperficial.find(filtro)
		.populate('aterro')
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
		
		MarcoSuperficial.count(filtro)
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});		
	}
};

