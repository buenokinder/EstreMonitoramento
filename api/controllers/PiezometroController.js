/**
 * PiezometroController
 *
 * @description :: Server-side logic for managing Piezometroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');

module.exports = {

	monitoramentos: function(req, res){
		var _that = this;

		var execute = new Promise( function( resolve, reject )
	    {
			var filtro ={};
			var dataInicial =new Date(new Date().setDate(new Date().getDate()-30));
			var dataFinal =new Date();

			if(undefined!=req.param('dtIni') && ''!=req.param('dtIni')){
				dataInicial = new Date(req.param('dtIni'));				
			}

			if(undefined!=req.param('dtFim') && ''!=req.param('dtFim') ){
				dataFinal = new Date(req.param('dtFim'));				
			}

			//filtro.medicoes = {dataMedicao:{ '>=': dataInicial, '<=': dataFinal }}; 

			if(req.param('pz')!=undefined){
				filtro.id = req.param('pz');				
			}

			console.log("filtro", filtro);
			var piezometro = Piezometro.find(filtro).
								populate('aterro').
								populate('medicoes');

			var sortString = req.param('order');
			piezometro.sort(sortString);

			piezometro.exec(function result(err, piezometros) {

				console.log("piezometros", piezometros);

				for(var i=0;i<piezometros.length;i++){
					var piezometro = piezometros[i];
					for(var j=0;j<piezometros[i].medicoes.length;j++){
						var medicao = piezometros[i].medicoes[j];

						if(medicao.dataMedicao<dataInicial 
							|| medicao.dataMedicao>dataFinal)
							continue;

						var salienciaInicialEstimada = piezometro.salienciaInicial -1;
						var profundidadeDescontandoCortes = 0;

						if(j==0){
							profundidadeDescontandoCortes = 
								medicao.prolongamentoCorte=="-"?
									piezometro.profundidadeTotalInicial:
									piezometro.profundidadeTotalInicial+medicao.prolongamentoCorte;
						}else{
							var medicaoAnterior = piezometros[i].medicoes[j-1];

							profundidadeDescontandoCortes = 
								medicao.prolongamentoCorte=="-" || medicao.prolongamentoCorte==0?
									medicaoAnterior.profundidadeDescontandoCortes:
									(medicaoAnterior.profundidadeDescontandoCortes+medicao.prolongamentoCorte);

						}

						var profundidadeTotalAtual = profundidadeDescontandoCortes - salienciaInicialEstimada;
						var profundidadeMediaCamaradeCargaDescontandoCortes=0;

						if(j==0){
							profundidadeMediaCamaradeCargaDescontandoCortes = 
								medicao.prolongamentoCorte=="-"?
									piezometro.profundidadeTotalCamaraCarga:
									piezometro.profundidadeTotalCamaraCarga+medicao.prolongamentoCorte;
						}else{
							var medicaoAnterior = piezometros[i].medicoes[j-1];

							profundidadeMediaCamaradeCargaDescontandoCortes = 
								medicao.prolongamentoCorte=="-" || medicao.prolongamentoCorte==0?
									medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes:
									(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes+medicao.prolongamentoCorte);
						}
						var profundidadeMediaCamaradeCarga = profundidadeMediaCamaradeCargaDescontandoCortes - salienciaInicialEstimada;




					}
				}



				total = piezometros.length;



				return resolve(piezometros);
			});

	    });
	    
		execute.then(function(results){
		    res.json(results);
		});
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

		Piezometro.find(filtro)
		.populate('aterro')
		.populate('alertas')
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
		
		Piezometro.count(filtro)
		.exec(function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json(ret); 
		  }
		});		
	}
};


