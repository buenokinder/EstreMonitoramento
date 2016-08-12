
/**
 * MarcoSuperficialController
 *
 * @description :: Server-side logic for managing Marcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {

	summarizeMonitoramento:function(marcosSuperficiais){

		var result = [];

		for(var i=0;i<marcosSuperficiais.length;i++){
			var item = {};
			item.marcoSuperficial = marcosSuperficiais[i].nome;
			item.data = marcosSuperficiais[i].data;
			item.norte = marcosSuperficiais[i].norte;
			item.leste = marcosSuperficiais[i].leste;
			item.cota = marcosSuperficiais[i].cota;
			item.deslocamentoHorizontalParcial = null;
			item.deslocamentoHorizontalTotal = null;
			item.velocidadeHorizontal = null;
			item.velocidadeVertical = null;
			item.criterioAlerta= null;
			item.deslocamentoVerticalParcial= null;
			item.deslocamentoVerticalTotal= null;
			item.sentidoDeslocamentoDirerencaNorte= null;
			item.sentidoDeslocamentoDirerencaEste= null;
			item.sentidoDeslocamentoNorteSul= null;
			item.sentidoDeslocamentoLesteOeste= null;
			item.sentido= null;
			item.nomeTopografo = null;
			item.nomeAuxiliar = null;
			item.criterioAlertaHorizontalMetodologia1= null;
			item.criterioAlertaVerticalMetodologia1= null;
			item.criterioAlertaHorizontalMetodologia2= null;
			item.criterioAlertaVerticalMetodologia2= null;
			item.vetorDeslocamentoSeno = null;
			item.vetorDeslocamentoAngulo = null;

			result.push(item);

			for(var j=0;j<marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length;j++){
				var item = {};
				item.marcoSuperficial = marcosSuperficiais[i].nome;
				item.norte = marcosSuperficiais[i].norte;
				item.leste = marcosSuperficiais[i].leste;
				item.cota = marcosSuperficiais[i].cota;
				item.data = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].data
				item.nomeTopografo = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].owner.nomeTopografo;
				item.temperatura = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].owner.temperatura;
				item.nomeAuxiliar =marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].owner.nomeAuxiliar;
				item.deslocamentoHorizontalParcial = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.deslocamentoHorizontalParcial;
				item.deslocamentoHorizontalTotal = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.deslocamentoHorizontalTotal;
				item.velocidadeHorizontal = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.velocidadeHorizontal;
				item.velocidadeVertical = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.velocidadeVertical;
				item.criterioAlerta= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlerta;
				item.deslocamentoVerticalParcial= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.deslocamentoVerticalParcial;
				item.deslocamentoVerticalTotal= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.deslocamentoVerticalTotal;
				item.sentidoDeslocamentoDirerencaNorte= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.sentidoDeslocamentoDirerencaNorte;
				item.sentidoDeslocamentoDirerencaEste= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.sentidoDeslocamentoDirerencaEste;
				item.sentidoDeslocamentoNorteSul= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.sentidoDeslocamentoNorteSul;
				item.sentidoDeslocamentoLesteOeste= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.sentidoDeslocamentoLesteOeste;
				item.sentido= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.sentido;
				item.criterioAlertaHorizontalMetodologia1= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaHorizontalMetodologia1;
				item.criterioAlertaVerticalMetodologia1= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaVerticalMetodologia1;
				item.criterioAlertaHorizontalMetodologia2= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaHorizontalMetodologia2;
				item.criterioAlertaVerticalMetodologia2= marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaVerticalMetodologia2;
				item.vetorDeslocamentoSeno = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.vetorDeslocamentoSeno;
				item.vetorDeslocamentoAngulo =  marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.vetorDeslocamentoAngulo;
				result.push(item);
			}
		}

		return result;
	},

	monitoramentos: function(req, res){
		var _that = this;

		var execute = new Promise( function( resolve, reject )
	    {
			var total=0;
			var totalCarregados=0;

			var graus = function(angulo){
				return angulo * (180/Math.PI);
			}


			Alerta.find({}, function(err, alertas){

				var filtro ={};
				
				if(req.param('ms')!=undefined){
					filtro.id = req.param('ms');				
				}

				var marcoSuperficial = MarcoSuperficial.find(filtro).populate('aterro');
				var sortString = req.param('order');
				marcoSuperficial.sort(sortString);

				marcoSuperficial.exec(function result(err, marcosSuperficiais) {
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
						                retorno.sentidoDeslocamentoLesteOeste = "Leste";
						            else
						                retorno.sentidoDeslocamentoLesteOeste = "Oeste";


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
						            retorno.criterioAlertaVerticalMetodologia1 = "Ok";
						            for (k = 0; k < alertas.length; k++) {
						                if (retorno.velocidadeHorizontal > alertas[k].velocidade)
						                    retorno.criterioAlertaHorizontalMetodologia1 = alertas[k].nivel;

						                if (retorno.velocidadeHorizontal > alertas[k].velocidade)
						                    retorno.criterioAlertaVerticalMetodologia1 = alertas[k].nivel;
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
						            	retorno.criterioAlertaVerticalMetodologia2 ="COND MIN";
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
						            retorno.vetorDeslocamentoAngulo = parseFloat(graus(angulo),2);

									marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento=retorno;
								}
							}

							return resolve(_that.summarizeMonitoramento(marcosSuperficiais));
						}					
					};

					var initLoadDetalhe = function(index, dataInicial, dataFinal){
						marcosSuperficiais[index].loadDetalhes(endLoadDetalhe, marcosSuperficiais, index, dataInicial, dataFinal);
					};

					if(null==marcosSuperficiais || marcosSuperficiais.length==0){
						return resolve(marcosSuperficiais);
					}

					var dataInicial =new Date(new Date().setDate(new Date().getDate()-30));
					var dataFinal =new Date();

					if(undefined!=req.param('dtIni') && ''!=req.param('dtIni')){
						dataInicial = new Date(req.param('dtIni'));				
					}

					if(undefined!=req.param('dtFim') && ''!=req.param('dtFim') ){
						dataFinal = new Date(req.param('dtFim'));				
					}
					console.log("dataInicial",dataInicial);
					console.log("dataFinal",dataFinal);

					for(var index=0;index<marcosSuperficiais.length;index++){
						initLoadDetalhe(index, dataInicial, dataFinal);
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

