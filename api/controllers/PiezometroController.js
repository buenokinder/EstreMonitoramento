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

					var first = true;

					for(var j=0;j<piezometros[i].medicoes.length;j++){

						var medicao = piezometro.medicoes[j];

						if (medicao.dataMedicao < dataInicial
							|| medicao.dataMedicao > dataFinal)
							continue;

						medicao.owner  ={id: piezometro.id, nome: piezometro.nome};
						medicao.saliencia = parseFloat(medicao.saliencia);
						medicao.celulaPiezometrica = parseFloat(piezometro.celulaPiezometrica);
						medicao.salienciaInicialEstimada = (medicao.saliencia - 1);
						medicao.profundidadeMediaCamaraCargaInicial = parseFloat(piezometro.profundidadeMediaCamaraCargaInicial);
						medicao.profundidadeTotalInicial = parseFloat(piezometro.profundidadeTotalInicial);
						medicao.profundidadeDescontandoCortes = 0;
						medicao.prolongamentoCorte = parseFloat(medicao.prolongamentoCorte);

						if (first == true) {
						    
						    medicao.profundidadeDescontandoCortes = medicao.prolongamentoCorte == "-" ?
                                                                        medicao.profundidadeTotalInicial :
                                                                        parseFloat(medicao.profundidadeTotalInicial + parseFloat(medicao.prolongamentoCorte));
						}else{
							var medicaoAnterior = piezometro.medicoes[j-1];

							medicao.profundidadeDescontandoCortes = 
								medicao.prolongamentoCorte=="-" || medicao.prolongamentoCorte==0?
									medicaoAnterior.profundidadeDescontandoCortes :
									parseFloat(medicaoAnterior.profundidadeDescontandoCortes + parseFloat(medicao.prolongamentoCorte));
						}


						medicao.profundidadeTotalAtual = parseFloat(medicao.profundidadeDescontandoCortes - medicao.salienciaInicialEstimada);
						medicao.profundidadeMediaCamaradeCargaDescontandoCortes=0;

						if (first == true) {
						    first = false;

							medicao.profundidadeMediaCamaradeCargaDescontandoCortes = 
								medicao.prolongamentoCorte=="-"?
									medicao.profundidadeMediaCamaraCargaInicial :
									parseFloat(medicao.profundidadeMediaCamaraCargaInicial + medicao.prolongamentoCorte);
						}else{
							var medicaoAnterior = piezometro.medicoes[j-1];

							medicao.profundidadeMediaCamaradeCargaDescontandoCortes = 
								medicao.prolongamentoCorte=="-" || medicao.prolongamentoCorte==0?
									parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes) :
									parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes + medicao.prolongamentoCorte);
						}
						medicao.profundidadeMediaCamaradeCarga = (medicao.profundidadeMediaCamaradeCargaDescontandoCortes - medicao.salienciaInicialEstimada);

						
						medicao.medicoesNivelChorumeComPressaoNivelEfetivo = parseFloat(medicao.medicoesNivelChorumeComPressaoNivelMedido - medicao.saliencia);
						medicao.medicoesNivelChorumeSemPressaoNivelEfetivo = parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelMedido - medicao.saliencia);
						medicao.baseAteNivelU = parseFloat(medicao.profundidadeTotalAtual - medicao.celulaPiezometrica - medicao.medicoesNivelChorumeSemPressaoNivelEfetivo);
						medicao.profundidadeEnterradaZ = medicao.profundidadeTotalAtual;
						medicao.ru = medicao.profundidadeEnterradaZ==0?"-"
										:(parseFloat(medicao.baseAteNivelU/medicao.profundidadeEnterradaZ).toFixed(2));

						if (isNaN(medicao.ru)) {
						    medicao.ru = "-";
						}

						if (medicao.ru=="-" || medicao.ru==null){
							medicao.criterioAlertaRu = "-";
						}

						if (!isNaN(medicao.ru) && medicao.ru<0.55){
							medicao.criterioAlertaRu = "Bom";
						}

						if (!isNaN(medicao.ru) && medicao.ru >= 0.55 && medicao.ru < 0.6) {
							medicao.criterioAlertaRu = "Atenção";
						}

						if (!isNaN(medicao.ru) && medicao.ru >= 0.6 && medicao.ru < 0.8) {
							medicao.criterioAlertaRu = "Alerta";
						}

						if (!isNaN(medicao.ru) && medicao.ru >= 0.8) {
							medicao.criterioAlertaRu = "Intervenção";
						}

						
						var pressaoMcaChorume = parseFloat((medicao.saliencia + medicao.profundidadeMediaCamaradeCargaDescontandoCortes) - parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelMedido));

						medicao.pressaoMcaChorume = pressaoMcaChorume < 0 ? 0 : pressaoMcaChorume.toFixed(2);
						medicao.pressaoMcaColunaComPressao = parseFloat(medicao.profundidadeDescontandoCortes - medicao.medicoesNivelChorumeComPressaoNivelEfetivo);
						medicao.pressaoMcaColunaSemPressao = parseFloat(medicao.profundidadeDescontandoCortes - medicao.medicoesNivelChorumeSemPressaoNivelEfetivo);
						medicao.pressaoMcaGasPio = parseFloat(medicao.pressaoMcaColunaComPressao - medicao.pressaoMcaColunaSemPressao);


						medicao.saliencia = medicao.saliencia.toFixed(2);
						medicao.celulaPiezometrica = medicao.celulaPiezometrica.toFixed(2);
						medicao.salienciaInicialEstimada = medicao.salienciaInicialEstimada.toFixed(2);
						medicao.profundidadeMediaCamaraCargaInicial = medicao.profundidadeMediaCamaraCargaInicial.toFixed(2);
						medicao.profundidadeTotalInicial = medicao.profundidadeTotalInicial.toFixed(2);
						medicao.profundidadeDescontandoCortes = medicao.profundidadeDescontandoCortes.toFixed(2);
						medicao.prolongamentoCorte = medicao.prolongamentoCorte.toFixed(2);
						medicao.pressaoMcaChorume = parseFloat(medicao.pressaoMcaChorume).toFixed(2);
						medicao.pressaoMcaColunaComPressao = medicao.pressaoMcaColunaComPressao.toFixed(2);
						medicao.pressaoMcaColunaSemPressao = medicao.pressaoMcaColunaSemPressao.toFixed(2);
						medicao.pressaoMcaGasPio = medicao.pressaoMcaGasPio.toFixed(2);
						medicao.profundidadeDescontandoCortes = parseFloat(medicao.profundidadeDescontandoCortes).toFixed(2);
						medicao.profundidadeTotalAtual = medicao.profundidadeTotalAtual.toFixed(2);
						medicao.profundidadeMediaCamaradeCargaDescontandoCortes = medicao.profundidadeMediaCamaradeCargaDescontandoCortes.toFixed(2);
						medicao.profundidadeMediaCamaradeCarga = medicao.profundidadeMediaCamaradeCarga.toFixed(2);
						medicao.medicoesNivelChorumeComPressaoNivelEfetivo = medicao.medicoesNivelChorumeComPressaoNivelEfetivo.toFixed(2);
						medicao.medicoesNivelChorumeSemPressaoNivelEfetivo = medicao.medicoesNivelChorumeSemPressaoNivelEfetivo.toFixed(2);
						medicao.baseAteNivelU = medicao.baseAteNivelU.toFixed(2);
						medicao.profundidadeEnterradaZ = medicao.profundidadeEnterradaZ.toFixed(2);

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


