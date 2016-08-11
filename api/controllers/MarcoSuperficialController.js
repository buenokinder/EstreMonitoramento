/**
 * MarcoSuperficialController
 *
 * @description :: Server-side logic for managing Marcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {

	monitoramentos: function(req, res){

		var execute = new Promise( function( resolve, reject )
	    {
			var total=0;
			var totalCarregados=0;
			Math.__proto__.graus = function(angulo){
				return angulo * (180/Math.PI);
			}

			Alerta.find({}, function(err, alertas){
				console.log("alertas", alertas);
				MarcoSuperficial.find({})
				.populate('aterro')
				.exec(function result(err, marcosSuperficiais) {
					total = marcosSuperficiais.length;

					var endLoadDetalhe = function(marcosSuperficiais, index, detalhes)
					{
						marcosSuperficiais[index].medicaoMarcoSuperficialDetalhes = detalhes;
						totalCarregados+=1;
						if(total==totalCarregados){
								
							for(var i=0;i<marcosSuperficiais.length;i++){

								var MedicaoInicial = marcosSuperficiais[i];
								MedicaoInicial.data = MedicaoInicial.dataInstalacao;

								for(var j=0;j<marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length;j++){
								    var retorno = {
								        deslocamentoHorizontalParcial: [],
								        deslocamentoHorizontalTotal: ([]),
								        velocidadeHorizontal: ([]),
								        velocidadeVertical: ([]),
								        criterioAlerta: Math.pow(2, 2)
								    };

									var MedicaoAtual = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j];
									var MedicaoAnterior = j==0?MedicaoInicial:marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j-1];
									
									MedicaoAtual.data = MedicaoAtual.owner.data;
									MedicaoAnterior.data= j==0?MedicaoInicial.data:marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j-1].owner.data;

									var deltaParcialNorte = Math.pow((MedicaoAtual.norte - MedicaoAnterior.norte), 2);
									var deltaParcialEste = Math.pow((MedicaoAtual.leste - MedicaoAnterior.leste), 2);
									var deltaTotalNorte = Math.pow((MedicaoAtual.norte - MedicaoInicial.norte), 2);
									var deltaTotalEste = Math.pow((MedicaoAtual.leste - MedicaoInicial.leste), 2);

			            			DataAtual = Math.floor(MedicaoAtual.data.getTime() / (3600 *24 *1000));
						            DataAnterior = Math.floor(MedicaoAnterior.data.getTime() / (3600*24*1000));
						            DiferencaDatas = DataAtual - DataAnterior;

									retorno.deslocamentoVerticalParcial = parseFloat((MedicaoAtual.cota - MedicaoAnterior.cota) * 100).toFixed(2);
									retorno.deslocamentoVerticalTotal = parseFloat((MedicaoAtual.cota - MedicaoInicial.cota) * 100).toFixed(2);
									retorno.deslocamentoHorizontalParcial = parseFloat(Math.sqrt(deltaParcialNorte + deltaParcialEste) * 100).toFixed(2);
									retorno.deslocamentoHorizontalTotal = parseFloat(Math.sqrt(deltaTotalNorte + deltaTotalEste) * 100).toFixed(2);
									retorno.velocidadeHorizontal = parseFloat(retorno.deslocamentoHorizontalParcial / DiferencaDatas).toFixed(2);
									retorno.velocidadeVertical = parseFloat(Math.abs(retorno.deslocamentoVerticalParcial / DiferencaDatas)).toFixed(2);

						            retorno.sentidoDeslocamentoDirerencaNorte = parseFloat((MedicaoAtual.norte - MedicaoInicial.norte) * 100).toFixed(2);
						            retorno.sentidoDeslocamentoDirerencaEste = parseFloat((MedicaoAtual.leste - MedicaoInicial.leste) * 100).toFixed(2);
						            

						            if (retorno.sentidoDeslocamentoDirerencaNorte > 0)
						                retorno.sentidoDeslocamentoNorteSul = "Norte";
						            else
						                retorno.sentidoDeslocamentoNorteSul = "Sul";

						            if (retorno.sentidoDeslocamentoDirerencaEste > 0)
						                retorno.sentidoDeslocamentoLesteOeste = "Oeste";
						            else
						                retorno.sentidoDeslocamentoLesteOeste = "Leste";


						            if(retorno.sentidoDeslocamentoNorteSul=="Sul" && retorno.sentidoDeslocamentoLesteOeste=="Leste")
						            {
						            	retorno.sentido = 	"Sudeste";
						            }
						            else{
							            if(retorno.sentidoDeslocamentoNorteSul=="Sul" && retorno.sentidoDeslocamentoLesteOeste=="Oeste"){
							            	retorno.sentido = "Sudoeste";
							            }else{
							            	if(retorno.sentidoDeslocamentoNorteSul=="Norte" && retorno.sentidoDeslocamentoLesteOeste=="Leste"){
							            		retorno.sentido = "Nordeste";
							            	}else{
							            		retorno.sentido = "Noroeste";
							            	}
							            }

						            }






						            retorno.criterioAlertaHorizontalMetodologia1 = "Ok";
						            retorno.criterioAlertaHorizontalVertical1 = "Ok";
						            for (k = 0; k < alertas.length; k++) {
						                if (retorno.velocidadeHorizontal > alertas[k].velocidade)
						                    retorno.criterioAlertaHorizontalMetodologia1 = alertas[k].nivel;

						                if (retorno.velocidadeHorizontal > alertas[k].velocidade)
						                    retorno.criterioAlertaHorizontalVertical1 = alertas[k].nivel;
						            }

						            if (retorno.velocidadeHorizontal <=1){
						            	retorno.criterioAlertaHorizontalMetodologia2 ="COND. MIN.";

						            }else{
						             	if(1<retorno.velocidadeHorizontal && retorno.velocidadeHorizontal<=2){
											retorno.criterioAlertaHorizontalMetodologia2 ="ATENÇÃO";
										}else{
							             	if(2<retorno.velocidadeHorizontal && retorno.velocidadeHorizontal<=5){
												retorno.criterioAlertaHorizontalMetodologia2 ="ALERTA";
											}						            	
											else{
												retorno.criterioAlertaHorizontalMetodologia2 ="INTERVENÇÃO";
											}											
										}
						            }


						            if (retorno.velocidadeVertical <=2){
						            	retorno.criterioAlertaVerticalMetodologia2 ="COND. MIN.";

						            }else{
						             	if(2<retorno.velocidadeVertical && retorno.velocidadeVertical<=4){
											retorno.criterioAlertaVerticalMetodologia2 ="ATENÇÃO";
										}else{
							             	if(4<retorno.velocidadeVertical && retorno.velocidadeVertical<=10){
												retorno.criterioAlertaVerticalMetodologia2 ="ALERTA";
											}						            	
											else{
												retorno.criterioAlertaVerticalMetodologia2 ="INTERVENÇÃO";
											}											
										}
						            }

						            retorno.vetorDeslocamentoSeno = parseFloat(Math.abs(retorno.sentidoDeslocamentoDirerencaEste/retorno.deslocamentoHorizontalTotal),2);
						            var angulo = Math.asin(retorno.vetorDeslocamentoSeno);
						            retorno.vetorDeslocamentoAngulo = parseFloat(Math.graus(angulo),2);

									marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento=retorno;
								}
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

