
/**
 * MarcoSuperficialController
 *
 * @description :: Server-side logic for managing Marcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {

    _marcosSuperficiais: ([]),
    _alertas: ([]),
    _totalMarcosSuperficias: 0,
    _totalMarcosSuperficiasCarregados: 0,

	summarizeMonitoramento:function(marcosSuperficiais){

		var result = [];

		for (var i in marcosSuperficiais) {
		    if (undefined == marcosSuperficiais[i] || undefined == marcosSuperficiais[i].aterro) continue;

			var item = {};
			
			item.id = marcosSuperficiais[i].id;
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
			item.vetorDeslocamentoSeno = null;
			item.vetorDeslocamentoAngulo = null;

			item.aterro = { id: marcosSuperficiais[i].aterro.id, nome: marcosSuperficiais[i].aterro.nome };

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
				item.vetorDeslocamentoSeno = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.vetorDeslocamentoSeno;
				item.vetorDeslocamentoAngulo =  marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.vetorDeslocamentoAngulo;
				result.push(item);
			}
		}

		return result;
	},

	summarizeMonitoramentoMapa: function (marcosSuperficiais) {

	    var result = [];

	    for (var i in marcosSuperficiais) {
	        if (undefined == marcosSuperficiais[i] || undefined == marcosSuperficiais[i].aterro) continue;

	        var item = {};

	        if (marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length == 0) {
	            item.marcoSuperficial = marcosSuperficiais[i].nome;
	            item.norte = marcosSuperficiais[i].norte;
	            item.leste = marcosSuperficiais[i].leste;
	            item.criterioAlertaHorizontalMetodologia1 = "";
	            item.criterioAlertaVerticalMetodologia1 = "";
	            result.push(item);
	        }

	        for (var j = 0; j < marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length; j++) {
	            var item = {};
	            item.marcoSuperficial = marcosSuperficiais[i].nome;
	            item.norte = marcosSuperficiais[i].norte;
	            item.leste = marcosSuperficiais[i].leste;
	            item.criterioAlertaHorizontalMetodologia1 = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaHorizontalMetodologia1;
	            item.criterioAlertaVerticalMetodologia1 = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaVerticalMetodologia1;
	            result.push(item);
	        }
	    }

	    return result;
	},


	orderByDateAsc: function (a, b) {
	    if (a.dataMedicao < b.dataMedicao)
	        return -1;
	    if (a.dataMedicao > b.dataMedicao)
	        return 1;

	    return 0;
	},

	orderByDateDesc: function (a, b) {
	    if (a.dataMedicao > b.dataMedicao)
	        return -1;
	    if (a.dataMedicao < b.dataMedicao)
	        return 1;
	    return 0;
	},

	extractOwners: function (detalhes) {
	    var owners = [];

	    for (var i = 0; i < detalhes.length; i++) {
	        var exists = false;

	        for (var j = 0; j < owners.length; j++) {
	            if (detalhes[i].owner['id'] == owners[j].id) {
	                exists = true;
	                break;
	            }
	        }

	        if (!exists) {
	            owners.push(detalhes[i].owner);
	        }
	    }


	    return owners;
	},

	listDetalhesByOwnerDate: function (detalhes) {

	    var owners = this.extractOwners(detalhes);
	    owners.sort(this.orderByDateAsc);

	    var ret = [];

	    for (var i = 0; i < owners.length; i++) {
	        for (var j = 0; j < detalhes.length; j++) {
	            if (detalhes[j].owner['id'] == owners[i].id) {
	                ret.push(detalhes[j]);
	            }
	        }
	    }

	    return ret;
	},

	getDate: function (value, hr, min, sec) {
	    var ret = value.split('-');
	    var ano = ret[0];
	    var mes = parseInt(ret[1]) - 1;

	    ret = ret[2].split(' ');
	    var dia = ret[0];
	    var hora = (undefined != hr ? hr : 0);
	    var minuto = (undefined != min ? min : 0);;
	    var segundos = (undefined != sec ? sec : 0);;

	    var possuiHoras = ret.length > 1;

	    if (possuiHoras) {
	        ret = ret[1].split(':')
	        hora = ret[0];
	        minuto = ret[1];
	    }

	    return new Date(ano, mes, dia, hora, minuto, segundos);

	},

	getFiltrosMarco: function (req) {

	    var filtro = {};
	    //var dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
	    //var dataFinal = new Date();

	    if (req.param('ms') != undefined) {
	        filtro.id = req.param('ms').split(',');
	    }

	    if (req.param('aterro') != undefined) {
	        filtro.aterro = req.param('aterro').split(',');
	    }

	    //if (undefined != req.param('data')) {
	    //    dataInicial = this.getDate(req.param('data'), 0, 0, 0);
	    //    dataFinal = this.getDate(req.param('data'), 23, 59, 59);

	    //    filtro.dataInstalacao = { '>=': dataInicial, '<=': dataFinal };
	    //    return filtro;
	    //}

	    //if (undefined != req.param('dtIni') && '' != req.param('dtIni')) {
	    //    dataInicial = this.getDate(req.param('dtIni'), 0, 0, 0);
	    //} else {
	    //    dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
	    //    dataInicial.setHours(0);
	    //    dataInicial.setMinutes(0);
	    //    dataInicial.setSeconds(0);
	    //}

	    //if (undefined != req.param('dtFim') && '' != req.param('dtFim')) {
	    //    dataFinal = this.getDate(req.param('dtFim'), 23, 59, 59);
	    //} else {
	    //    dataFinal = new Date();
	    //    dataInicial.setHours(23);
	    //    dataInicial.setMinutes(59);
	    //    dataInicial.setSeconds(59);
	    //}

	    //filtro.dataInstalacao = { '>=': dataInicial, '<=': dataFinal };

	    return filtro;
	},

    getFiltrosDetalhes:function(req){

        var filtro = {};

        var dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
        var dataFinal = new Date();

        if (undefined != req.param('data') && '' != req.param('data')) {
            dt = req.param('data').split('-');
            dataInicial = this.getDate(req.param('data'), 0, 0, 0);
            dataFinal = this.getDate(req.param('data'), 23, 59, 59);

            filtro.data = { '>=': dataInicial, '<=': dataFinal };
			console.log(filtro.data);
            return filtro;
        }

        if (undefined != req.param('dtIni') && '' != req.param('dtIni')) {
            dataInicial = this.getDate(req.param('dtIni'), 0, 0, 0);
        }
        else {
            dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
            dataInicial.setHours(0);
            dataInicial.setMinutes(0);
            dataInicial.setSeconds(0);
        }

        if (undefined != req.param('dtFim') && '' != req.param('dtFim')) {
            dataFinal = this.getDate(req.param('dtFim'), 23, 59, 59);
        } else {
            dataFinal = new Date();
            dataInicial.setHours(23);
            dataInicial.setMinutes(59);
            dataInicial.setSeconds(59);
        }

        filtro.data = { '>=': dataInicial, '<=': dataFinal };

        return filtro;
    },

    loadMedicoesDetalhes: function (marcoSuperficialId) {

        var marcoSuperficial = this._marcosSuperficiais[marcoSuperficialId];

        var graus = function (angulo) {
            return angulo * (180 / Math.PI);
        }

        for (var j = 0; j < marcoSuperficial.medicaoMarcoSuperficialDetalhes.length; j++) {
            var first = (j == 0);

            var monitoramento = {
                deslocamentoHorizontalParcial: [],
                deslocamentoHorizontalTotal: ([]),
                velocidadeHorizontal: ([]),
                velocidadeVertical: ([]),
                criterioAlerta: Math.pow(2, 2)
            };

            var medicaoAtual = marcoSuperficial.medicaoMarcoSuperficialDetalhes[j];
            var medicaoAnterior = first ? marcoSuperficial : marcoSuperficial.medicaoMarcoSuperficialDetalhes[j - 1];

            medicaoAtual.data = medicaoAtual.owner.data;
            medicaoAnterior.data = first ? marcoSuperficial.data : marcoSuperficial.medicaoMarcoSuperficialDetalhes[j - 1].owner.data;

            var deltaParcialNorte = Math.pow((medicaoAtual.norte - medicaoAnterior.norte), 2);
            var deltaParcialEste = Math.pow((medicaoAtual.leste - medicaoAnterior.leste), 2);
            var deltaTotalNorte = Math.pow((medicaoAtual.norte - marcoSuperficial.norte), 2);
            var deltaTotalEste = Math.pow((medicaoAtual.leste - marcoSuperficial.leste), 2);

            DataAtual = Math.floor(medicaoAtual.data.getTime() / (3600 * 24 * 1000));
            DataAnterior = Math.floor(medicaoAnterior.data.getTime() / (3600 * 24 * 1000));
            DiferencaDatas = DataAtual - DataAnterior;

            monitoramento.deslocamentoVerticalParcial = parseFloat((medicaoAtual.cota - medicaoAnterior.cota) * 100).toFixed(4);
            monitoramento.deslocamentoVerticalTotal = parseFloat((medicaoAtual.cota - marcoSuperficial.cota) * 100).toFixed(4);
            monitoramento.deslocamentoHorizontalParcial = parseFloat(Math.sqrt(deltaParcialNorte + deltaParcialEste) * 100).toFixed(4);
            monitoramento.deslocamentoHorizontalTotal = parseFloat(Math.sqrt(deltaTotalNorte + deltaTotalEste) * 100).toFixed(4);

            monitoramento.velocidadeHorizontal = (DiferencaDatas == 0 ? 0 : parseFloat(monitoramento.deslocamentoHorizontalParcial / DiferencaDatas).toFixed(4));
            monitoramento.velocidadeVertical = (DiferencaDatas == 0 ? 0 : parseFloat(Math.abs(monitoramento.deslocamentoVerticalParcial / DiferencaDatas)).toFixed(4));

            monitoramento.sentidoDeslocamentoDirerencaNorte = parseFloat((medicaoAtual.norte - marcoSuperficial.norte) * 100).toFixed(4);
            monitoramento.sentidoDeslocamentoDirerencaEste = parseFloat((medicaoAtual.leste - marcoSuperficial.leste) * 100).toFixed(4);


            if (monitoramento.sentidoDeslocamentoDirerencaNorte > 0)
                monitoramento.sentidoDeslocamentoNorteSul = "Norte";
            else
                monitoramento.sentidoDeslocamentoNorteSul = "Sul";

            if (monitoramento.sentidoDeslocamentoDirerencaEste > 0)
                monitoramento.sentidoDeslocamentoLesteOeste = "Leste";
            else
                monitoramento.sentidoDeslocamentoLesteOeste = "Oeste";

            if (monitoramento.sentidoDeslocamentoNorteSul == "Sul" && monitoramento.sentidoDeslocamentoLesteOeste == "Leste") {
                monitoramento.sentido = "Sudeste";
            }
            else {
                if (monitoramento.sentidoDeslocamentoNorteSul == "Sul" && monitoramento.sentidoDeslocamentoLesteOeste == "Oeste") {
                    monitoramento.sentido = "Sudoeste";
                } else {
                    if (monitoramento.sentidoDeslocamentoNorteSul == "Norte" && monitoramento.sentidoDeslocamentoLesteOeste == "Leste") {
                        monitoramento.sentido = "Nordeste";
                    } else {
                        monitoramento.sentido = "Noroeste";
                    }
                }
            }

            monitoramento.criterioAlertaHorizontalMetodologia1 = "Aceitável";
            monitoramento.criterioAlertaVerticalMetodologia1 = "Aceitável";

            for (k = 0; k < this._alertas.length; k++) {
                if (monitoramento.velocidadeHorizontal > this._alertas[k].velocidade)
                    monitoramento.criterioAlertaHorizontalMetodologia1 = this._alertas[k].nivel;

                if (monitoramento.velocidadeHorizontal > this._alertas[k].velocidade)
                    monitoramento.criterioAlertaVerticalMetodologia1 = this._alertas[k].nivel;
            }

            monitoramento.vetorDeslocamentoSeno = parseFloat(Math.abs(monitoramento.sentidoDeslocamentoDirerencaEste / monitoramento.deslocamentoHorizontalTotal), 2).toFixed(4);
            var angulo = Math.asin(monitoramento.vetorDeslocamentoSeno);
            monitoramento.vetorDeslocamentoAngulo = parseFloat(graus(angulo), 2).toFixed(4);

            marcoSuperficial.medicaoMarcoSuperficialDetalhes[j].monitoramento = monitoramento;

        }
        this._marcosSuperficiais[marcoSuperficialId] = marcoSuperficial;
    },

    monitoramentos: function (req, res) {
		var _that = this;

		var execute = new Promise( function( resolve, reject )
		{
		    _that._totalMarcosSuperficias = 0;
		    _that._totalMarcosSuperficiasCarregados = 0;
		    _that._marcosSuperficiais = ([]);
		    _that._alertas = ([]);

			Alerta.find({}, function(err, alertas){
			    _that._alertas = alertas;
			    var filtro = _that.getFiltrosMarco(req);				
				
				var marcoSuperficial = MarcoSuperficial.find(filtro).populate('aterro');
				var sortString = req.param('order');

				marcoSuperficial.sort(sortString);

				marcoSuperficial.exec(function result(err, marcosSuperficiais) {

				    if (null == marcosSuperficiais || marcosSuperficiais.length == 0) {
				        return resolve(marcosSuperficiais);
				    }

					_that._totalMarcosSuperficias = marcosSuperficiais.length;

					for (var i = 0; i < marcosSuperficiais.length; i++) {

					    var filtroDetalhes = _that.getFiltrosDetalhes(req);
					    filtroDetalhes.marcoSuperficial = marcosSuperficiais[i].id;
					    marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes = [];
					    marcosSuperficiais[i].data = marcosSuperficiais[i].dataInstalacao;
					    _that._marcosSuperficiais[marcosSuperficiais[i].id] = marcosSuperficiais[i];

					    var sort = 'data Desc';
					    if (undefined != req.param('order') &&  (req.param('order').toLowerCase().indexOf("asc") >= 0)) {
					        sort = 'data Asc';
					    }

					    var f = { where: filtroDetalhes, sort: sort};

					    if (req.param('limitMedicoes') != undefined) {
					        f.limit = req.param('limitMedicoes');
					    }

					    MedicaoMarcoSuperficialDetalhes.find(f).populate("owner").exec(function (err, detalhes) {
					        //ret = _that.listDetalhesByOwnerDate(detalhes);
					        var possuiDetalhes = null != detalhes && undefined != detalhes && detalhes.length;
					        var marcoSuperficialId = possuiDetalhes ? detalhes[0].marcoSuperficial : '';

					        if (marcoSuperficialId != '') {
					            _that._marcosSuperficiais[marcoSuperficialId].medicaoMarcoSuperficialDetalhes = detalhes;
					            _that.loadMedicoesDetalhes(marcoSuperficialId);
					        }

					        _that._totalMarcosSuperficiasCarregados += 1;

					        if (_that._totalMarcosSuperficias == _that._totalMarcosSuperficiasCarregados) {
					            if (undefined != req.param("tipo") && req.param("tipo") == "mapa") {
					                return resolve(_that.summarizeMonitoramentoMapa(_that._marcosSuperficiais));
					            }

					            return resolve(_that.summarizeMonitoramento(_that._marcosSuperficiais));
					        }
					    });
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

		if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            
            filtro.aterro = req.session.me.aterro.id;
		}

		console.log("filtro", filtro);

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

		if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {

		    filtro.aterro = req.session.me.aterro.id;
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

