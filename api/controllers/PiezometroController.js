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

    _orderByDateAsc: function (a, b) {
        if (a.dataMedicao < b.dataMedicao)
            return -1;
        if (a.dataMedicao > b.dataMedicao)
            return 1;

        return 0;
    },

    _orderByDateDesc: function (a, b) {
        if (a.dataMedicao > b.dataMedicao)
            return -1;
        if (a.dataMedicao < b.dataMedicao)
            return 1;
        return 0;
    },

    _aterros: [],

    _extractUsuariosAterro: function (aterro) {
        var ret = [];

        for (var i = 0; i < this._aterros.length; i++) {
            if (this._aterros[i].id == aterro.id) {
                var usuarios = this._aterros[i].usuarios;

                for (var j = 0; j < usuarios.length; j++) {
                    var usuario = { name: usuarios[j].name, email: usuarios[j].email, perfil: usuarios[j].perfil };
                    ret.push(usuario);
                }
                break;
            }
        }

        return ret;
    },

    monitoramentosnotificacao: function (req, res) {
        var _that = this;
        var piezometrosRet = [];

        var execute = new Promise(function (resolve, reject) {



            var _monitoramentosnotificacao = function () {

                var piezometro = Piezometro.find({}).
                                    populate('aterro').
                                    populate('medicoes');

                piezometro.exec(function result(err, piezometros) {
                    var totalMedicoes = 0;
                    var totalMedicoesCarregadas = 0;
                    for (var i = 0; i < piezometros.length; i++) {
                        totalMedicoes += piezometros[i].medicoes.length;
                    }

                    for (var i = 0; i < piezometros.length; i++) {
                        var piezometro = piezometros[i];
                        piezometros[i].medicoes.sort(_that._orderByDateAsc);

                        var first = true;

                        piezometrosRet.push({
                            id: piezometro.id, nome: piezometro.nome,
                            aterro: {
                                id: piezometro.aterro.id,
                                nome: piezometro.aterro.nome,
                                usuarios: _that._extractUsuariosAterro(piezometro.aterro)
                            },
                            medicoes: []
                        });

                        for (var j = 0; j < piezometro.medicoes.length; j++) {

                            var medicao = piezometro.medicoes[j];
                            medicao.owner = { id: piezometro.id, nome: piezometro.nome };
                            medicao.saliencia = parseFloat(medicao.saliencia);
                            medicao.celulaPiezometrica = parseFloat(piezometro.celulaPiezometrica);
                            medicao.salienciaInicialEstimada = parseFloat(medicao.saliencia) - parseFloat(piezometro.salienciaInicial);
                            medicao.profundidadeMediaCamaraCargaInicial = parseFloat(piezometro.profundidadeMediaCamaraCargaInicial);
                            medicao.profundidadeTotalInicial = parseFloat(piezometro.profundidadeTotalInicial);
                            medicao.profundidadeDescontandoCortes = 0;
                            medicao.prolongamentoCorte = parseFloat(medicao.prolongamentoCorte);

                            if (first == true) {

                                medicao.profundidadeDescontandoCortes = medicao.prolongamentoCorte == "-" || medicao.prolongamentoCorte == 0 ?
                                                                            parseFloat(medicao.profundidadeTotalInicial) :
                                                                            parseFloat(parseFloat(medicao.profundidadeTotalInicial) + parseFloat(medicao.prolongamentoCorte));
                            } else {
                                var medicaoAnterior = piezometro.medicoes[j - 1];

                                medicao.profundidadeDescontandoCortes =
                                    medicao.prolongamentoCorte == "-" || medicao.prolongamentoCorte == 0 ?
                                        parseFloat(medicaoAnterior.profundidadeDescontandoCortes) :
                                        parseFloat(parseFloat(medicaoAnterior.profundidadeDescontandoCortes) + parseFloat(medicao.prolongamentoCorte));

                            }

                            medicao.profundidadeTotalAtual = parseFloat(medicao.profundidadeDescontandoCortes) - parseFloat(medicao.salienciaInicialEstimada);
                            medicao.profundidadeMediaCamaradeCargaDescontandoCortes = 0;
                            var medicaoAnterior = null;

                            if (first == true) {
                                first = false;

                                medicao.profundidadeMediaCamaradeCargaDescontandoCortes =
                                    medicao.prolongamentoCorte == "-" ?
                                        parseFloat(medicao.profundidadeMediaCamaraCargaInicial) :
                                        parseFloat(medicao.profundidadeMediaCamaraCargaInicial) + parseFloat(medicao.prolongamentoCorte);
                            } else {
                                medicaoAnterior = piezometro.medicoes[j - 1];

                                medicao.profundidadeMediaCamaradeCargaDescontandoCortes =
                                    medicao.prolongamentoCorte == "-" || medicao.prolongamentoCorte == 0 ?
                                        parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes) :
                                        parseFloat(parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes) + parseFloat(medicao.prolongamentoCorte));
                            }


                            medicao.profundidadeMediaCamaradeCarga = parseFloat(medicao.profundidadeMediaCamaradeCargaDescontandoCortes) - parseFloat(medicao.salienciaInicialEstimada);
                            medicao.medicoesNivelChorumeComPressaoNivelEfetivo = parseFloat(medicao.medicoesNivelChorumeComPressaoNivelMedido) - parseFloat(medicao.saliencia);
                            medicao.medicoesNivelChorumeSemPressaoNivelEfetivo = parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelMedido) - parseFloat(medicao.saliencia);
                            medicao.baseAteNivelU = parseFloat(medicao.profundidadeTotalAtual) - parseFloat(medicao.celulaPiezometrica) - parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelEfetivo);
                            medicao.profundidadeEnterradaZ = medicao.profundidadeTotalAtual;
                            medicao.ru = medicao.profundidadeEnterradaZ == 0 ? "-"
                                            : (parseFloat(medicao.baseAteNivelU / medicao.profundidadeEnterradaZ).toFixed(2));

                            medicao.criterioAlertaRu = "-";

                            if (isNaN(medicao.ru)) {
                                medicao.ru = "-";
                            }

                            if (medicao.ru == "-" || medicao.ru == null) {
                                medicao.criterioAlertaRu = "-";
                            }

                            if (!isNaN(medicao.ru) && medicao.ru <= piezometro.nivelAceitavel) {
                                medicao.criterioAlertaRu = "Aceitável";
                            }

                            if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelAceitavel && medicao.ru <= piezometro.nivelRegular) {
                                medicao.criterioAlertaRu = "Regular";
                            }

                            if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelRegular && medicao.ru <= piezometro.nivelAtencao) {
                                medicao.criterioAlertaRu = "Atenção";
                            }

                            if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelAtencao && medicao.ru <= piezometro.nivelIntervencao) {
                                medicao.criterioAlertaRu = "Intervenção";
                            }

                            if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelIntervencao) {
                                medicao.criterioAlertaRu = "Paralisação";
                            }

                            var loadNotificacoes = function (index, medicao) {
                                MedicaoPiezometroNotificacao.find({ owner: medicao.id }).exec(function (err, notificacoes) {
                                    totalMedicoesCarregadas += 1;
                                    var notificacao = {};
                                    if (notificacoes && notificacoes.length > 0) {
                                        if (notificacoes[0].status == "Finalizada") {
                                            return;
                                        }
                                        notificacao = {
                                            data: notificacoes[0].data,
                                            status: notificacoes[0].status,
                                            id: notificacoes[0].id,
                                            emailgerenteadmin: notificacoes[0].emailgerenteadmin,
                                            emailgerenteadmindiretor: notificacoes[0].emailgerenteadmindiretor,
                                            emaildiretor: notificacoes[0].emaildiretor
                                        };
                                    }

                                    piezometrosRet[index].medicoes.push({
                                        id: medicao.id,
                                        criterioAlertaRu: medicao.criterioAlertaRu,
                                        obsGestor: medicao.obsGestor,
                                        data: medicao.dataMedicao,
                                        notificacao: notificacao
                                    });
                                });
                            };

                            loadNotificacoes(piezometrosRet.length - 1, medicao);
                        }
                    }

                    var itv = setInterval(function () {
                        if (totalMedicoes == totalMedicoesCarregadas) {
                            clearInterval(itv);
                            return resolve(piezometrosRet);
                        }
                    }, 10);

                });

            };


            if (undefined == _that._aterros || _that._aterros.length == 0) {
                Aterro.find({}).populate("usuarios").exec(function (err, aterros) {
                    if (err) {
                        return resolve(err);
                    }

                    _that._aterros = aterros;
                    _monitoramentosnotificacao();
                });
            } else {
                _monitoramentosnotificacao();
            }
        });

        execute.then(function (results) {
            res.json(results);
        });
    },

    monitoramentos: function (req, res) {
        var _that = this;
        var itens = [];

        var execute = new Promise(function (resolve, reject) {
            var filtro = {};
            var dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
            var dataFinal = new Date();

            if (undefined != req.param('dtIni') && '' != req.param('dtIni')) {
                dataInicial = new Date(req.param('dtIni'));
            }

            if (undefined != req.param('dtFim') && '' != req.param('dtFim')) {
                dataFinal = new Date(req.param('dtFim'));
            }

            if (req.param('pz') != undefined) {
                filtro.id = req.param('pz').split(',');
            }

            var piezometro = Piezometro.find(filtro).
								populate('aterro').
								populate('medicoes');

            var sortString = req.param('order') || "asc";

            piezometro.exec(function result(err, piezometros) {

                for (var i = 0; i < piezometros.length; i++) {
                    var piezometro = piezometros[i];
                    if (sortString == "asc") {
                        piezometros[i].medicoes.sort(_that._orderByDateAsc);
                    } else {
                        piezometros[i].medicoes.sort(_that._orderByDateDesc);
                    }

                    var first = true;

                    for (var j = 0; j < piezometros[i].medicoes.length; j++) {

                        var medicao = piezometro.medicoes[j];

                        if (medicao.dataMedicao < dataInicial
							|| medicao.dataMedicao > dataFinal)
                            continue;

                        medicao.owner = { id: piezometro.id, nome: piezometro.nome };
                        medicao.saliencia = parseFloat(medicao.saliencia);
                        medicao.celulaPiezometrica = parseFloat(piezometro.celulaPiezometrica);
                        //medicao.salienciaInicialEstimada = (medicao.saliencia - 1);

                        medicao.salienciaInicialEstimada = parseFloat(medicao.saliencia) - parseFloat(piezometro.salienciaInicial);

                        medicao.profundidadeMediaCamaraCargaInicial = parseFloat(piezometro.profundidadeMediaCamaraCargaInicial);
                        medicao.profundidadeTotalInicial = parseFloat(piezometro.profundidadeTotalInicial);
                        medicao.profundidadeDescontandoCortes = 0;
                        medicao.prolongamentoCorte = parseFloat(medicao.prolongamentoCorte);

                        if (first == true) {

                            medicao.profundidadeDescontandoCortes = medicao.prolongamentoCorte == "-" || medicao.prolongamentoCorte == 0 ?
                                                                        parseFloat(medicao.profundidadeTotalInicial) :
                                                                        parseFloat(parseFloat(medicao.profundidadeTotalInicial) + parseFloat(medicao.prolongamentoCorte));
                        } else {
                            var medicaoAnterior = piezometro.medicoes[j - 1];

                            medicao.profundidadeDescontandoCortes =
								medicao.prolongamentoCorte == "-" || medicao.prolongamentoCorte == 0 ?
									parseFloat(medicaoAnterior.profundidadeDescontandoCortes) :
									parseFloat(parseFloat(medicaoAnterior.profundidadeDescontandoCortes) + parseFloat(medicao.prolongamentoCorte));

                        }



                        medicao.profundidadeTotalAtual = parseFloat(medicao.profundidadeDescontandoCortes) - parseFloat(medicao.salienciaInicialEstimada);
                        medicao.profundidadeMediaCamaradeCargaDescontandoCortes = 0;
                        var medicaoAnterior = null;

                        if (first == true) {
                            first = false;

                            medicao.profundidadeMediaCamaradeCargaDescontandoCortes =
								medicao.prolongamentoCorte == "-" ?
									parseFloat(medicao.profundidadeMediaCamaraCargaInicial) :
									parseFloat(medicao.profundidadeMediaCamaraCargaInicial) + parseFloat(medicao.prolongamentoCorte);
                        } else {
                            medicaoAnterior = piezometro.medicoes[j - 1];

                            medicao.profundidadeMediaCamaradeCargaDescontandoCortes =
								medicao.prolongamentoCorte == "-" || medicao.prolongamentoCorte == 0 ?
									parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes) :
									parseFloat(parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes) + parseFloat(medicao.prolongamentoCorte));
                        }


                        medicao.profundidadeMediaCamaradeCarga = parseFloat(medicao.profundidadeMediaCamaradeCargaDescontandoCortes) - parseFloat(medicao.salienciaInicialEstimada);

                        medicao.medicoesNivelChorumeComPressaoNivelEfetivo = parseFloat(medicao.medicoesNivelChorumeComPressaoNivelMedido) - parseFloat(medicao.saliencia);
                        medicao.medicoesNivelChorumeSemPressaoNivelEfetivo = parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelMedido) - parseFloat(medicao.saliencia);
                        medicao.baseAteNivelU = parseFloat(medicao.profundidadeTotalAtual) - parseFloat(medicao.celulaPiezometrica) - parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelEfetivo);
                        medicao.profundidadeEnterradaZ = medicao.profundidadeTotalAtual;
                        medicao.ru = medicao.profundidadeEnterradaZ == 0 ? "-"
										: (parseFloat(medicao.baseAteNivelU / medicao.profundidadeEnterradaZ).toFixed(2));

                        medicao.criterioAlertaRu = "-";

                        if (isNaN(medicao.ru)) {
                            medicao.ru = "-";
                        }

                        if (medicao.ru == "-" || medicao.ru == null) {
                            medicao.criterioAlertaRu = "-";
                        }

                        if (!isNaN(medicao.ru) && medicao.ru <= piezometro.nivelAceitavel) {
                            medicao.criterioAlertaRu = "Aceitável";
                        }

                        if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelAceitavel && medicao.ru <= piezometro.nivelRegular) {
                            medicao.criterioAlertaRu = "Regular";
                        }

                        if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelRegular && medicao.ru <= piezometro.nivelAtencao) {
                            medicao.criterioAlertaRu = "Atenção";
                        }

                        if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelAtencao && medicao.ru <= piezometro.nivelIntervencao) {
                            medicao.criterioAlertaRu = "Intervenção";
                        }

                        if (!isNaN(medicao.ru) && medicao.ru > piezometro.nivelIntervencao) {
                            medicao.criterioAlertaRu = "Paralisação";
                        }
                        var pressaoMcaChorume = null;

                        if (medicaoAnterior == null) {
                            pressaoMcaChorume = parseFloat(medicao.saliencia) + parseFloat(medicao.profundidadeMediaCamaradeCargaDescontandoCortes) - parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelMedido);
                        } else {
                            //console.log("medicaoAnterior", medicaoAnterior);
                            pressaoMcaChorume = parseFloat(medicao.saliencia) + parseFloat(medicaoAnterior.profundidadeMediaCamaradeCargaDescontandoCortes) - parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelMedido);


                        }

                        medicao.pressaoMcaChorume = pressaoMcaChorume < 0 ? 0 : pressaoMcaChorume.toFixed(2);
                        medicao.pressaoMcaColunaComPressao = parseFloat(medicao.profundidadeDescontandoCortes) - parseFloat(medicao.medicoesNivelChorumeComPressaoNivelEfetivo);
                        medicao.pressaoMcaColunaSemPressao = parseFloat(medicao.profundidadeDescontandoCortes) - parseFloat(medicao.medicoesNivelChorumeSemPressaoNivelEfetivo);
                        medicao.pressaoMcaGasPio = parseFloat(medicao.pressaoMcaColunaComPressao) - parseFloat(medicao.pressaoMcaColunaSemPressao);


                        medicao.saliencia = medicao.saliencia.toFixed(2);
                        medicao.celulaPiezometrica = medicao.celulaPiezometrica.toFixed(2);
                        medicao.salienciaInicialEstimada = medicao.salienciaInicialEstimada.toFixed(2);
                        medicao.profundidadeMediaCamaraCargaInicial = medicao.profundidadeMediaCamaraCargaInicial.toFixed(2);
                        medicao.profundidadeTotalInicial = medicao.profundidadeTotalInicial.toFixed(2);

                        medicao.profundidadeDescontandoCortes = parseFloat(medicao.profundidadeDescontandoCortes).toFixed(2);

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

        execute.then(function (results) {
            res.json(results);
        });
    },


    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }

        Piezometro.find(filtro)
		.populate('aterro')
		.populate('alertas')
		.populate('usuario')
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        res.json(ret);
		    }
		});
    },

    searchCount: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }

        Piezometro.count(filtro)
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        res.json(ret);
		    }
		});
    }
};


