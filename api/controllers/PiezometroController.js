/**
 * PiezometroController
 *
 * @description :: Server-side logic for managing Piezometroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');

module.exports = {

    getDate: function (value) {
        var date = new Date(value.valueOf() + value.getTimezoneOffset() * 60000)
        return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
    },

    orderByDateAsc: function (a,b) {
          if (a.dataMedicao < b.dataMedicao)
            return -1;
          if (a.dataMedicao> b.dataMedicao)
            return 1;
        
          return 0;
    },

  	orderByDateDesc: function (a,b) {
          if (a.dataMedicao > b.dataMedicao)
            return -1;
          if (a.dataMedicao< b.dataMedicao)
            return 1;
          return 0;
    },
	monitoramentos: function(req, res){
		var _that = this;
		var itens = [];

		var execute = new Promise( function( resolve, reject )
	    {
			var filtro ={};
			var dataInicial =new Date(new Date().setDate(new Date().getDate()-30));
			var dataFinal = new Date();

			if(undefined!=req.param('dtIni') && ''!=req.param('dtIni')){
			    dataInicial = new Date(req.param('dtIni'));
			}

			if(undefined!=req.param('dtFim') && ''!=req.param('dtFim') ){
			    dataFinal = new Date(req.param('dtFim'));
			}

			if(req.param('pz')!=undefined){
				filtro.id = req.param('pz').split(',');				
			}

		//	dataFinal = dataFinalContemHora ? dataFinal : _that.getDate(dataFinal);
			//dataInicial = dataInicialContemHora ? dataInicial : _that.getDate(dataInicial);

			var piezometro = Piezometro.find(filtro).
								populate('aterro').
								populate('medicoes');

			var sortString = "desc";

			if(req.param('order')=="asc" || req.param('order')==""  || req.param('order')==undefined){
				sortString = "asc";
			}
			

			piezometro.exec(function result(err, piezometros) {

				for(var i=0;i<piezometros.length;i++){
					var piezometro = piezometros[i];
					if(sortString=="asc"){
						piezometros[i].medicoes.sort(_that.orderByDateAsc);
					}else{
						piezometros[i].medicoes.sort(_that.orderByDateDesc);
					}

					for(var j=0;j<piezometros[i].medicoes.length;j++){

						var medicao = piezometro.medicoes[j];
					    //var dataMedicao = _that.getDate(medicao.dataMedicao);

						if (medicao.dataMedicao < dataInicial
							|| medicao.dataMedicao > dataFinal)
							continue;

						medicao.owner  ={id: piezometro.id, nome: piezometro.nome};
						medicao.salienciaInicial = parseFloat(piezometro.salienciaInicial); 
						medicao.celulaPiezometrica = parseFloat(piezometro.celulaPiezometrica);
						medicao.salienciaInicialEstimada = medicao.salienciaInicial -1;
						medicao.profundidadeMediaCamaraCargaInicial = parseFloat(piezometro.profundidadeMediaCamaraCargaInicial);
						medicao.profundidadeTotalInicial = parseFloat(piezometro.profundidadeTotalInicial);
						//medicao.prolongamentoCorte = parseFloat(piezometro.prolongamentoCorte);
						medicao.profundidadeDescontandoCortes = 0;

						if(j==0){
							medicao.profundidadeDescontandoCortes = 
								medicao.prolongamentoCorte=="-"?
									medicao.profundidadeTotalInicial:
									medicao.profundidadeTotalInicial+parseFloat(medicao.prolongamentoCorte);
						}else{
							var medicaoAnterior = piezometro.medicoes[j-1];

							medicao.profundidadeDescontandoCortes = 
								medicao.prolongamentoCorte=="-" || medicao.prolongamentoCorte==0?
									medicaoAnterior.profundidadeDescontandoCortes:
									(medicaoAnterior.profundidadeDescontandoCortes+parseFloat(medicao.prolongamentoCorte));

						}

						medicao.profundidadeTotalAtual = medicao.profundidadeDescontandoCortes - medicao.salienciaInicialEstimada;
						medicao.profundidadeMediaCamaradeCargaDescontandoCortes=0;

						if(j==0){
							medicao.profundidadeMediaCamaradeCargaDescontandoCortes = 
								medicao.prolongamentoCorte=="-"?
									medicao.profundidadeMediaCamaraCargaInicial:
									medicao.profundidadeMediaCamaraCargaInicial+medicao.prolongamentoCorte;
						}else{
							var medicaoAnterior = piezometro.medicoes[j-1];

							medicao.profundidadeMediaCamaradeCargaDescontandoCortes = 
								medicao.prolongamentoCorte=="-" || medicao.prolongamentoCorte==0?
									medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes:
									(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes+medicao.prolongamentoCorte);
						}
						medicao.profundidadeMediaCamaradeCarga = medicao.profundidadeMediaCamaradeCargaDescontandoCortes - medicao.salienciaInicialEstimada;
 						medicao.medicoesNivelChorumeComPressaoNivelEfetivo = medicao.medicoesNivelChorumeComPressaoNivelMedido - medicao.salienciaInicial;
 						medicao.medicoesNivelChorumeSemPressaoNivelEfetivo = medicao.medicoesNivelChorumeSemPressaoNivelMedido - medicao.salienciaInicial;
						medicao.baseAteNivelU = medicao.profundidadeTotalAtual-medicao.celulaPiezometrica-medicao.medicoesNivelChorumeSemPressaoNivelEfetivo;
						medicao.profundidadeEnterradaZ = medicao.profundidadeTotalAtual;
						medicao.ru = medicao.profundidadeEnterradaZ==0?"-"
										:(parseFloat(medicao.baseAteNivelU/medicao.profundidadeEnterradaZ).toFixed(2));

						if (medicao.ru=="-" || medicao.ru==null){
							medicao.criterioAlertaRu = "-";
						}

						if (medicao.ru<0.55){
							medicao.criterioAlertaRu = "Bom";
						}

						if (medicao.ru>=0.55 && medicao.ru<0.6){
							medicao.criterioAlertaRu = "Atenção";
						}

						if (medicao.ru>=0.6 && medicao.ru<0.8){
							medicao.criterioAlertaRu = "Alerta";
						}

						if (medicao.ru>=0.8){
							medicao.criterioAlertaRu = "Intervenção";
						}

						
						var pressaoMcaChorume = (medicao.saliencia + medicao.profundidadeMediaCamaradeCargaDescontandoCortes)-medicao.medicoesNivelChorumeSemPressaoNivelMedido;
						medicao.pressaoMcaChorume = pressaoMcaChorume<0?0:pressaoMcaChorume;
						medicao.pressaoMcaColunaComPressao = medicao.profundidadeDescontandoCortes - medicao.medicoesNivelChorumeComPressaoNivelEfetivo;
						medicao.pressaoMcaColunaSemPressao = medicao.profundidadeDescontandoCortes - medicao.medicoesNivelChorumeSemPressaoNivelEfetivo;
						medicao.pressaoMcaGasPio = medicao.pressaoMcaColunaComPressao - medicao.pressaoMcaColunaSemPressao;
 						itens.push(medicao);
					}
				}

				return resolve(itens);
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


