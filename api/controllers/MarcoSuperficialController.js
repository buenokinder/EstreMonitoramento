
/**
 * MarcoSuperficialController
 *
 * @description :: Server-side logic for managing Marcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

Number.prototype.format = function (n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

module.exports = {
    _alertas: ([]),
    _alertaAceitavel: {},
    _alertaRegular: {},
    _rearrange: function (marcoSuperficiais, req) {

        var ret = [];
        var detalhes = [];

        var _extractOwners = function () {

            var owners = {};
            for (var i = 0; i < marcoSuperficiais.length; i++) {
                var medicoes = marcoSuperficiais[i].medicoes;

                for (var j = 0; j < medicoes.length; j++) {
                    if (owners[medicoes[j].owner.id] == undefined) {
                        var owner = medicoes[j].owner;
                        owners[medicoes[j].owner.id] = owner;
                        var usuariosAterro = [];

                        for (var k = 0; k < marcoSuperficiais[i].usuariosAterro.length; k++) {
                            var usuario = {
                                name: marcoSuperficiais[i].usuariosAterro[k].name,
                                email: marcoSuperficiais[i].usuariosAterro[k].email,
                                perfil: marcoSuperficiais[i].usuariosAterro[k].perfil
                            };
                            usuariosAterro.push(usuario);
                        }

                        owners[medicoes[j].owner.id].usuariosAterro = usuariosAterro;
                        
                    }
                }
            }

            return owners;
        };
        var _extractDetalhes = function () {
            var ret = [];
            for (var i = 0; i < marcoSuperficiais.length; i++) {
                var medicoes = marcoSuperficiais[i].medicoes;

                for (var j = 0; j < medicoes.length; j++) {
                    var medicao = medicoes[j];

                    ret.push({
                        id: medicao.id,
                        nome: medicao.nome,
                        data: medicao.data,
                        criterioAlertaHorizontalMetodologia1: medicao.criterioAlertaHorizontalMetodologia1,
                        criterioAlertaVerticalMetodologia1: medicao.criterioAlertaVerticalMetodologia1,
                        owner: medicao.owner.id
                    });
                }
            }
            return ret;
        };

        var owners = _extractOwners();
        var detalhes = _extractDetalhes();
        var filtroDatas = this._getFiltroDatas(req);

        for (var item in owners) {
            var medicao = { id: owners[item].id, obsGestor: owners[item].obsGestor, data: owners[item].data, notificacao: owners[item].notificacao, detalhes: [] };

            for (var i = 0; i < detalhes.length; i++) {

                if (detalhes[i].owner == owners[item].id) {


                    if (filtroDatas.dataInicial && filtroDatas.dataFinal) {
                        if (detalhes[i].data < filtroDatas.dataInicial || detalhes[i].data > filtroDatas.dataFinal) continue;
                    }

                    var detalhe = {
                        id: detalhes[i].id,
                        nome: detalhes[i].nome,
                        data: detalhes[i].data,
                        criterioAlertaHorizontalMetodologia1: detalhes[i].criterioAlertaHorizontalMetodologia1,
                        criterioAlertaVerticalMetodologia1: detalhes[i].criterioAlertaVerticalMetodologia1
                    };
                    medicao.detalhes.push(detalhe);
                }
            }
            ret.push({ usuariosAterro: owners[item].usuariosAterro, medicoes: medicao });
        }

        return ret;
    },

    _summarizeMonitoramentoNotificacao: function (_marcoSuperficiaisNotificacao, req) {
        var result = [];
        var _that = this;


        var sortDateAsc = function (a, b) {
            if (a.data < b.data)
                return -1;
            if (a.data > b.data)
                return 1;

            return 0;
        }
        
        for (var item in _marcoSuperficiaisNotificacao) {
            var marcoSuperficial = _marcoSuperficiaisNotificacao[item];

            if (undefined == marcoSuperficial) continue;

            var first = true;

            marcoSuperficial.medicoes.sort(sortDateAsc);
            // var ms = { marcoSuperficial: marcoSuperficial.nome, usuariosAterro: marcoSuperficial.usuariosaterro, medicoes: [] };
            var ms = { usuariosAterro: marcoSuperficial.usuariosaterro, medicoes: [] };

            for (var i = 0; i < marcoSuperficial.medicoes.length; i++) {
                var medicaoAtual = marcoSuperficial.medicoes[i];
                var medicaoAnterior = first ? marcoSuperficial : marcoSuperficial.medicoes[i - 1];

                var deltaParcialNorte = Math.pow((medicaoAtual.norte - medicaoAnterior.norte), 2);
                var deltaParcialEste = Math.pow((medicaoAtual.leste - medicaoAnterior.leste), 2);

                var dataAtual = Math.floor(medicaoAtual.data.getTime() / (3600 * 24 * 1000));
                var dataAnterior = Math.floor(medicaoAnterior.data.getTime() / (3600 * 24 * 1000));
                var diferencaDatas = dataAtual - dataAnterior;

                var deslocamentoVerticalParcial = parseFloat((parseFloat(medicaoAtual.cota) - parseFloat(medicaoAnterior.cota)) * 100).toFixed(4);
                var deslocamentoHorizontalParcial = parseFloat(Math.sqrt(parseFloat(deltaParcialNorte) + parseFloat(deltaParcialEste)) * 100).toFixed(4);
                var velocidadeHorizontal = (diferencaDatas == 0 ? 0 : parseFloat(parseFloat(deslocamentoHorizontalParcial) / parseFloat(diferencaDatas).toFixed(4)));
                var velocidadeVertical = (diferencaDatas == 0 ? 0 : parseFloat(Math.abs(parseFloat(deslocamentoVerticalParcial) / parseFloat(diferencaDatas))).toFixed(4));
                var velocidadeMinima = 0;


                for (k = 0; k < this._alertas.length; k++) {

                    velocidadeMinima = k == 0 ? -1 : parseFloat(this._alertas[k].velocidade);

                    if (parseFloat(velocidadeHorizontal) > velocidadeMinima && parseFloat(velocidadeHorizontal) <= parseFloat(this._alertas[k].velocidade)) {
                        marcoSuperficial.medicoes[i].criterioAlertaHorizontalMetodologia1 = this._alertas[k].nivel;
                    }

                    if (parseFloat(velocidadeVertical) > velocidadeMinima && parseFloat(velocidadeVertical) <= parseFloat(this._alertas[k].velocidade)) {
                        marcoSuperficial.medicoes[i].criterioAlertaVerticalMetodologia1 = this._alertas[k].nivel;
                    }
                }


                if (first) {
                    first = false;
                }

                ms.notificacoes = marcoSuperficial.medicoes[i].notificacoes;

                var dt = marcoSuperficial.medicoes[i];
                delete dt['norte'];
                delete dt['leste'];
                delete dt['cota'];
                ms.medicoes.push(dt);
            }

            result.push(ms);
        }

        return this._rearrange(result, req);
    },

    _summarizeMonitoramento: function (marcosSuperficiais, req) {

        var result = [];
        var filtroDatas = this._getFiltroDatas(req);
        var owner = req.param('owner');


        for (var i in marcosSuperficiais) {
            if (undefined == marcosSuperficiais[i] || undefined == marcosSuperficiais[i].aterro) continue;

            var item = {};
            var possuiDetalhesNoPeriodo = false;

            for (var j = 0; j < marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length; j++) {
                var detalhe = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j];

                if (filtroDatas.dataInicial && filtroDatas.dataFinal) {
                    if (detalhe.data < filtroDatas.dataInicial || detalhe.data > filtroDatas.dataFinal) continue;
                    possuiDetalhesNoPeriodo = true;
                }
            }

            var exibirMarcosSuperficiais = (owner == undefined) && possuiDetalhesNoPeriodo;

            if (exibirMarcosSuperficiais ) {

                item.id = marcosSuperficiais[i].id;
                item.marcoSuperficial = marcosSuperficiais[i].nome;
                item.data = marcosSuperficiais[i].data;
                item.norte = parseFloat(marcosSuperficiais[i].norte).format(4, 3, '.', ',');
                item.leste = parseFloat(marcosSuperficiais[i].leste).format(4, 3, '.', ',');
                item.cota = parseFloat(marcosSuperficiais[i].cota).format(4, 3, '.', ',');
                item.deslocamentoHorizontalParcial = 0;
                item.deslocamentoHorizontalTotal = 0;
                item.velocidadeHorizontal = 0;
                item.velocidadeVertical = 0;
                item.criterioAlerta = 0;
                item.deslocamentoVerticalParcial = 0;
                item.deslocamentoVerticalTotal = 0;
                item.sentidoDeslocamentoDirerencaNorte = 0;
                item.sentidoDeslocamentoDirerencaEste = 0;
                item.sentidoDeslocamentoNorteSul = 0;
                item.sentidoDeslocamentoLesteOeste = 0;
                item.sentido = 0;
                item.nomeTopografo = '';
                item.nomeAuxiliar = '';
                item.criterioAlertaHorizontalMetodologia1 = '';
                item.criterioAlertaVerticalMetodologia1 = '';
                item.criterioAceitavelVelocidade = this._alertaAceitavel.velocidade;
                item.criterioRegularVelocidade = this._alertaRegular.velocidade;

                item.vetorDeslocamentoSeno = 0;
                item.vetorDeslocamentoAngulo = 0;

                item.aterro = { id: marcosSuperficiais[i].aterro.id, nome: marcosSuperficiais[i].aterro.nome };

                result.push(item);

            }

            for (var j = 0; j < marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length; j++) {

                var detalhe = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j];
                var registroOrfao = (detalhe.owner == undefined); //TODO: Ao remover a medicao remover os detalhes.

                if (registroOrfao) continue;

                if (owner && detalhe.owner.id != owner) continue;

                if (filtroDatas.dataInicial && filtroDatas.dataFinal) {
                    if (detalhe.data < filtroDatas.dataInicial || detalhe.data > filtroDatas.dataFinal) continue;
                }

                var item = {};
                item.marcoSuperficial = marcosSuperficiais[i].nome;
                item.norte = parseFloat(detalhe.norte).format(4, 3, '.', ',');;
                item.leste = parseFloat(detalhe.leste).format(4, 3, '.', ','); ;
                item.cota = parseFloat(detalhe.cota).format(4, 3, '.', ','); ;
                item.data = detalhe.data
                item.nomeTopografo = detalhe.owner.nomeTopografo;
                item.temperatura = detalhe.owner.temperatura;
                item.nomeAuxiliar = detalhe.owner.nomeAuxiliar;
                item.deslocamentoHorizontalParcial = parseFloat(detalhe.monitoramento.deslocamentoHorizontalParcial).format(2, 3, '.', ',');
                item.deslocamentoHorizontalTotal = parseFloat(detalhe.monitoramento.deslocamentoHorizontalTotal).format(2, 3, '.', ',');
                item.velocidadeHorizontal = parseFloat(detalhe.monitoramento.velocidadeHorizontal).format(2, 3, '.', ',');
                item.velocidadeVertical = parseFloat(detalhe.monitoramento.velocidadeVertical).format(2, 3, '.', ',');
                item.criterioAlerta = detalhe.monitoramento.criterioAlerta;
                item.deslocamentoVerticalParcial = parseFloat(detalhe.monitoramento.deslocamentoVerticalParcial).format(2, 3, '.', ',');
                item.deslocamentoVerticalTotal = parseFloat(detalhe.monitoramento.deslocamentoVerticalTotal).format(2, 3, '.', ',');
                item.sentidoDeslocamentoDirerencaNorte = parseFloat(detalhe.monitoramento.sentidoDeslocamentoDirerencaNorte).format(2, 3, '.', ',');
                item.sentidoDeslocamentoDirerencaEste = parseFloat(detalhe.monitoramento.sentidoDeslocamentoDirerencaEste).format(2, 3, '.', ',');

                item.sentidoDeslocamentoNorteSul = detalhe.monitoramento.sentidoDeslocamentoNorteSul;
                item.sentidoDeslocamentoLesteOeste = detalhe.monitoramento.sentidoDeslocamentoLesteOeste;

                item.sentido = detalhe.monitoramento.sentido;
                item.criterioAlertaHorizontalMetodologia1 = detalhe.monitoramento.criterioAlertaHorizontalMetodologia1;
                item.criterioAlertaVerticalMetodologia1 = detalhe.monitoramento.criterioAlertaVerticalMetodologia1;

                item.criterioAceitavelVelocidade = this._alertaAceitavel.velocidade;
                item.criterioRegularVelocidade = this._alertaRegular.velocidade;

                item.vetorDeslocamentoSeno = parseFloat(detalhe.monitoramento.vetorDeslocamentoSeno).format(2, 3, '.', ',');
                item.vetorDeslocamentoAngulo = parseFloat(detalhe.monitoramento.vetorDeslocamentoAngulo).format(2, 3, '.', ',');

                item.medicaoMarcoSuperficial = { id: detalhe.owner.id, obsGestor: detalhe.owner.obsGestor, notificacao: detalhe.owner.notificacoes };

                result.push(item);
            }
        }

        return result;
    },

    _summarizeMonitoramentoRelatorio: function (marcosSuperficiais, req) {

        var result = [];
        var filtroDatas = this._getFiltroDatas(req);
        var owner = req.param('owner');
        var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        for (var i in marcosSuperficiais) {
            if (undefined == marcosSuperficiais[i] || undefined == marcosSuperficiais[i].aterro) continue;

            var item = {};

            for (var j = 0; j < marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length; j++) {

                var detalhe = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j];
                var registroOrfao = (detalhe.owner == undefined); //TODO: Ao remover a medicao remover os detalhes.

                if (registroOrfao) continue;

                if (owner && detalhe.owner.id != owner) continue;

                if (filtroDatas.dataInicial && filtroDatas.dataFinal) {
                    if (item.data < filtroDatas.dataInicial || item.data > filtroDatas.dataFinal) continue;
                }

                var item = {};
                item.marcoSuperficial = marcosSuperficiais[i].nome;
                item.mes = meses[(new Date(detalhe.data).getMonth())];
                item.criterioAlertaHorizontalMetodologia1 = detalhe.monitoramento.criterioAlertaHorizontalMetodologia1;
                item.criterioAlertaVerticalMetodologia1 = detalhe.monitoramento.criterioAlertaVerticalMetodologia1;

                result.push(item);
            }
        }

        return result;
    },

    _summarizeMonitoramentoMapa: function (marcosSuperficiais, req) {

        var result = [];
        var filtroDatas = this._getFiltroDatas(req);
        var owner = req.param('owner');
        for (var i in marcosSuperficiais) {
            if (undefined == marcosSuperficiais[i] || undefined == marcosSuperficiais[i].aterro) continue;

            var item = {};

            if (marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length == 0) {
                item.marcoSuperficial = marcosSuperficiais[i].nome;
                item.norte = marcosSuperficiais[i].norte;
                item.leste = marcosSuperficiais[i].leste;
                item.criterioAlertaHorizontalMetodologia1 = "";
                item.criterioAlertaVerticalMetodologia1 = "";
                item.criterioAceitavelVelocidade = this._alertaAceitavel.velocidade;
                item.criterioRegularVelocidade = this._alertaRegular.velocidade;
                result.push(item);
            }

            for (var j = 0; j < marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length; j++) {
                var item = {};


                if (owner && marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.owner.id != owner) continue;

                if (filtroDatas.dataInicial && filtroDatas.dataFinal) {
                    if (marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].data < filtroDatas.dataInicial || marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].data > filtroDatas.dataFinal) continue;
                }


                item.marcoSuperficial = marcosSuperficiais[i].nome;
                item.norte = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].norte;
                item.leste = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].leste;
                item.criterioAlertaHorizontalMetodologia1 = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaHorizontalMetodologia1;
                item.criterioAlertaVerticalMetodologia1 = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaVerticalMetodologia1;
                item.criterioAceitavelVelocidade = this._alertaAceitavel.velocidade;
                item.criterioRegularVelocidade = this._alertaRegular.velocidade;
                result.push(item);
            }
        }

        return result;
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

    _extractOwners: function (detalhes) {
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

    _joinMedicoesDetalhesNotificacoes: function (detalhes, notificacoes, _marcoSuperficiaisNotificacao, aterros) {

        for (var i = 0; i < detalhes.length; i++) {
            var registroOrfao = (detalhes[i].owner == undefined || detalhes[i].aterro == undefined); //TODO: Ao remover a medicao remover os detalhes.
            if (registroOrfao) continue;

            //  var exists = _marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id] != undefined;
            //var key = detalhes[i].owner.id;

            var key = detalhes[i].marcoSuperficial.id;

            var exists = _marcoSuperficiaisNotificacao[key] != undefined;

            if (!exists) {
                _marcoSuperficiaisNotificacao[key] = {};
                _marcoSuperficiaisNotificacao[key].nome = detalhes[i].marcoSuperficial.nome;
                _marcoSuperficiaisNotificacao[key].leste = detalhes[i].marcoSuperficial.leste;
                _marcoSuperficiaisNotificacao[key].norte = detalhes[i].marcoSuperficial.norte;
                _marcoSuperficiaisNotificacao[key].cota = detalhes[i].marcoSuperficial.cota;
                _marcoSuperficiaisNotificacao[key].aterro = detalhes[i].marcoSuperficial.aterro;
                _marcoSuperficiaisNotificacao[key].data = new Date(detalhes[i].marcoSuperficial.dataInstalacao);
                _marcoSuperficiaisNotificacao[key].usuariosaterro = this._extractUsuariosAterro(aterros, detalhes[i].aterro);
                _marcoSuperficiaisNotificacao[key].medicoes = [];
            }

            var medicao = {
                id: detalhes[i].owner.id,
                obsGestor: detalhes[i].owner.obsGestor,
                data: new Date(detalhes[i].owner.data),
                notificacao: {}
            };

            if (notificacoes.length > 0) {
                medicao.notificacao.id = notificacoes[0].id;
                medicao.notificacao.status = notificacoes[0].status;
                medicao.notificacao.data = notificacoes[0].data;
                medicao.notificacao.emailgerenteadmin = notificacoes[0].emailgerenteadmin;
                medicao.notificacao.emailgerenteadmindiretor = notificacoes[0].emailgerenteadmindiretor;
                medicao.notificacao.emaildiretor = notificacoes[0].emaildiretor;
            }

            var detalhe = {
                id: detalhes[i].id,
                nome: detalhes[i].nome,
                norte: detalhes[i].norte,
                leste: detalhes[i].leste,
                cota: detalhes[i].cota,
                data: new Date(detalhes[i].owner.data),
                criterioAlertaHorizontalMetodologia1: 'Paralisação',
                criterioAlertaVerticalMetodologia1: 'Paralisação',
                owner: medicao
            };
            _marcoSuperficiaisNotificacao[key].medicoes.push(detalhe);

            //_marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].medicoes.push(detalhe);
        }

        return _marcoSuperficiaisNotificacao;
    },

    _listDetalhesByOwnerDate: function (detalhes) {

        var owners = this._extractOwners(detalhes);
        owners.sort(this._orderByDateAsc);

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

    _getDate: function (value, hr, min, sec) {
        var ret = value.indexOf('-') > 0 ? value.split('-') : value.split('/');
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

    _getFiltroDatas: function (req) {

        var filtro = { 'dataInicial': undefined, 'dataFinal': undefined };

        if (undefined != req.param('data') && '' != req.param('data')) {
            dt = req.param('data').split('-');
            filtro.dataInicial = this._getDate(req.param('data'), 0, 0, 0);
            filtro.dataFinal = this._getDate(req.param('data'), 23, 59, 59);

            return filtro;
        }

        if (undefined != req.param('dtIni') && '' != req.param('dtIni')) {

            var possuiHoras = req.param('dtIni').indexOf(' ') > 0 && req.param('dtIni').indexOf(':') > 0;
            if (possuiHoras) {
                filtro.dataInicial = this._getDate(req.param('dtIni'));
            } else {
                filtro.dataInicial = this._getDate(req.param('dtIni'), 0, 0, 0);
            }
            
        }

        if (undefined != req.param('dtFim') && '' != req.param('dtFim')) {
            var possuiHoras = req.param('dtFim').indexOf(' ') > 0 && req.param('dtFim').indexOf(':') > 0;

            if (possuiHoras) {
                filtro.dataFinal = this._getDate(req.param('dtFim'));
            } else {
                filtro.dataFinal = this._getDate(req.param('dtFim'), 23, 59, 59);
            }
        }

        return filtro;
    },

    _getFiltrosMarco: function (req) {

        var filtro = {};

        if (req.param('ms') != undefined) {
            filtro.id = req.param('ms').split(',');
        }

        if (req.param('marcoSuperficial') != undefined) {
            filtro.nome = req.param('marcoSuperficial').split(',');
        }

        if (req.param('aterro') != undefined) {
            filtro.aterro = req.param('aterro').split(',');
        }

        return filtro;
    },

    _getFiltrosDetalhes: function (req) {

        var filtro = {};

        if (req.param('aterro') != undefined) {
            filtro.aterro = req.param('aterro').split(',');
        }

        //var dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
        //var dataFinal = new Date();

        //if (undefined != req.param('data') && '' != req.param('data')) {
        //    dt = req.param('data').split('-');
        //    dataInicial = this._getDate(req.param('data'), 0, 0, 0);
        //    dataFinal = this._getDate(req.param('data'), 23, 59, 59);

        //    filtro.data = { '>=': dataInicial, '<=': dataFinal };
        //    return filtro;
        //}

        //if (undefined != req.param('dtIni') && '' != req.param('dtIni')) {
        //    dataInicial = this._getDate(req.param('dtIni'), 0, 0, 0);
        //}
        //else {
        //    dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
        //    dataInicial.setHours(0);
        //    dataInicial.setMinutes(0);
        //    dataInicial.setSeconds(0);
        //}

        //if (undefined != req.param('dtFim') && '' != req.param('dtFim')) {
        //    dataFinal = this._getDate(req.param('dtFim'), 23, 59, 59);
        //} else {
        //    dataFinal = new Date();
        //    dataInicial.setHours(23);
        //    dataInicial.setMinutes(59);
        //    dataInicial.setSeconds(59);
        //}

        //filtro.data = { '>=': dataInicial, '<=': dataFinal };

        return filtro;
    },

    _loadMedicoesDetalhes: function (marcoSuperficial) {

        var graus = function (angulo) {
            return angulo * (180 / Math.PI);
        }
        var first = true;

        for (var j = 0; j < marcoSuperficial.medicaoMarcoSuperficialDetalhes.length; j++) {
            var registroOrfao = (marcoSuperficial.medicaoMarcoSuperficialDetalhes[j].owner == undefined); //TODO: Ao remover a medicao remover os detalhes.

            if (registroOrfao) continue;

          //  var first = (j == 0);

            var monitoramento = {
                deslocamentoHorizontalParcial: [],
                deslocamentoHorizontalTotal: ([]),
                velocidadeHorizontal: ([]),
                velocidadeVertical: ([]),
                criterioAlerta: Math.pow(2, 2),
                owner: marcoSuperficial.medicaoMarcoSuperficialDetalhes[j].owner.id
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

            monitoramento.criterioAlertaHorizontalMetodologia1 = "Paralisação";
            monitoramento.criterioAlertaVerticalMetodologia1 = "Paralisação";
            var velocidadeMinima = 0;

            for (k = 0; k < this._alertas.length; k++) {

                velocidadeMinima = k == 0 ? -1 : parseFloat(this._alertas[k-1].velocidade);

                if (parseFloat(monitoramento.velocidadeHorizontal) > velocidadeMinima && parseFloat(monitoramento.velocidadeHorizontal) <= parseFloat(this._alertas[k].velocidade)) {
                    monitoramento.criterioAlertaHorizontalMetodologia1 = this._alertas[k].nivel;
                }

                if (parseFloat(monitoramento.velocidadeVertical) > velocidadeMinima && parseFloat(monitoramento.velocidadeVertical) <= parseFloat(this._alertas[k].velocidade)) {
                    monitoramento.criterioAlertaVerticalMetodologia1 = this._alertas[k].nivel;
                }
            }

            monitoramento.criterioAceitavelVelocidadeHorizontal = monitoramento.velocidadeHorizontal / this._alertaAceitavel.velocidade;
            monitoramento.criterioAceitavelVelocidadeVertical = monitoramento.velocidadeVertical / this._alertaAceitavel.velocidade;
            monitoramento.criterioRegularVelocidadeHorizontal = monitoramento.velocidadeHorizontal / this._alertaRegular.velocidade;
            monitoramento.criterioRegularVelocidadeVertical = monitoramento.velocidadeVertical / this._alertaRegular.velocidade;
            monitoramento.vetorDeslocamentoSeno = parseFloat(Math.abs(monitoramento.sentidoDeslocamentoDirerencaEste / monitoramento.deslocamentoHorizontalTotal), 2).toFixed(4);

            if (isNaN(monitoramento.vetorDeslocamentoSeno)) {
                monitoramento.vetorDeslocamentoSeno = 0;
            }

            var angulo = Math.asin(monitoramento.vetorDeslocamentoSeno);
            monitoramento.vetorDeslocamentoAngulo = parseFloat(graus(angulo), 2).toFixed(4);

            if (isNaN(monitoramento.vetorDeslocamentoAngulo)) {
                monitoramento.vetorDeslocamentoAngulo = 0;
            }

            marcoSuperficial.medicaoMarcoSuperficialDetalhes[j].monitoramento = monitoramento;

            if (first)
                first = false;
        }

        return marcoSuperficial;
    },

    _getMedicoesPendentes: function (medicoes) {

        var ret = [];
        for (var i = 0; i < medicoes.length; i++) {
            var notificacoes = medicoes[i].notificacoes;

            for (var j = 0; j < notificacoes.length; j++) {
                if (notificacoes[j].status == "Pendente") {
                    ret.push(medicoes[i]);
                    break;
                }
            }
        }

        return ret;
    },

    _extractUsuariosAterro: function (aterros, aterro) {
        var ret = [];

        for (var i = 0; i < aterros.length; i++) {
            if (aterros[i].id == aterro.id) {
                ret = aterros[i].usuarios;
                break;
            }
        }

        return ret;
    },

    monitoramentosNotificacao: function (req, res) {
        var _that = this;
        var _aterros = ([]);

        var execute = new Promise(function (resolve, reject) {
            var _totalMarcosSuperficias = 0;
            var _marcoSuperficiaisNotificacao = ([]);

            Aterro.find({}).populate("usuarios").exec(function (err, aterros) {
                if (err) {
                    return resolve(err);
                }

                _aterros = aterros;

                var _monitoramentosNotificacao = function () {
                    var executeMedicoes = new Promise(function (resolveMedicoes, rejectMedicoes) {

                        MedicaoMarcoSuperficial.find().populate("notificacoes").sort("dataInstalacao asc").exec(function (err, result) {
                            if (err) {
                                return resolve(err);
                            }
                            //var medicoes = _that._getMedicoesPendentes(result);

                            var medicoes = result;
                            var totalDetalhesCarregados = 0;
                            if (medicoes.length == 0) {
                                return resolveMedicoes(medicoes);
                            }

                            for (var i = 0; i < medicoes.length; i++) {

                                var loadMedicoes = function (index) {
                                    var filtroDetalhes = { owner: medicoes[index].id };

                                    MedicaoMarcoSuperficialDetalhes.find(filtroDetalhes).populate("owner").populate("marcoSuperficial").populate("aterro").sort("data asc").exec(function (err, detalhes) {
                                        if (err) {
                                            return resolve(err);
                                        }

                                        _marcoSuperficiaisNotificacao = _that._joinMedicoesDetalhesNotificacoes(detalhes, medicoes[index].notificacoes, _marcoSuperficiaisNotificacao, _aterros);
                                        totalDetalhesCarregados += 1;

                                        if (totalDetalhesCarregados == medicoes.length) {
                                            return resolveMedicoes();
                                        }
                                    });
                                };
                                loadMedicoes(i);
                            }

                        });
                    });

                    executeMedicoes.then(function () {
                        return resolve(_that._summarizeMonitoramentoNotificacao(_marcoSuperficiaisNotificacao, req));
                    });

                };

                if (undefined == _that._alertas || _that._alertas.length == 0) {
                    Alerta.find({}, function (err, alertas) {
                        if (err) {
                            return resolve(err);
                        }
                        _that._alertas = alertas;
                        _monitoramentosNotificacao();
                    });

                } else {
                    _monitoramentosNotificacao();
                }
            });
        });

        execute.then(function (results) {
            res.json(results);
        });
    },

    _setAlertasAceitavelRegular: function () {
        for (var i = 0; i < this._alertas.length; i++) {
            if (this._alertas[i].nivel == 'Aceitável') {
                this._alertaAceitavel = this._alertas[i];
            }

            if (this._alertas[i].nivel == 'Regular') {
                this._alertaRegular = this._alertas[i];
            }
        }
    },

    monitoramentos: function (req, res) {
        var _that = this;

        var execute = new Promise(function (resolve, reject) {
            var _totalMarcosSuperficias = 0;
            var _totalMarcosSuperficiasCarregados = 0;
            var _marcosSuperficiais = ([]);

            var _monitoramentos = function () {
                var filtro = _that._getFiltrosMarco(req);

                var marcoSuperficial = MarcoSuperficial.find(filtro).populate('aterro');
                var sortString = req.param('order') || 'dataInstalacao asc';

                marcoSuperficial.sort(sortString);

                marcoSuperficial.exec(function result(err, marcosSuperficiais) {

                    if (null == marcosSuperficiais || marcosSuperficiais.length == 0) {
                        return resolve(marcosSuperficiais);
                    }

                    _totalMarcosSuperficias = marcosSuperficiais.length;

                    for (var i = 0; i < marcosSuperficiais.length; i++) {

                        var filtroDetalhes = {};

                        if (undefined == req.param('skipdatefilter')) {
                            filtroDetalhes = _that._getFiltrosDetalhes(req);
                        }

                        
                        filtroDetalhes.marcoSuperficial = marcosSuperficiais[i].id;
                        marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes = [];
                        marcosSuperficiais[i].data = marcosSuperficiais[i].dataInstalacao;
                        _marcosSuperficiais[marcosSuperficiais[i].id] = marcosSuperficiais[i];

                        var sort = 'data Asc';
                        if (undefined != req.param('order') && (req.param('order').toLowerCase().indexOf("desc") >= 0)) {
                            sort = 'data Desc';
                        }

                        var f = { where: filtroDetalhes, sort: sort };

                        if (req.param('limitMedicoes') != undefined) {
                            f.limit = req.param('limitMedicoes');
                        }

                        MedicaoMarcoSuperficialDetalhes.find(f).populate("owner").sort(sort).exec(function (err, detalhes) {

                            var possuiDetalhes = null != detalhes && undefined != detalhes && detalhes.length;
                            var marcoSuperficialId = possuiDetalhes ? detalhes[0].marcoSuperficial : '';

                            if (_marcosSuperficiais[marcoSuperficialId]) {
                                _marcosSuperficiais[marcoSuperficialId].medicaoMarcoSuperficialDetalhes = detalhes;
                                _marcosSuperficiais[marcoSuperficialId] = _that._loadMedicoesDetalhes(_marcosSuperficiais[marcoSuperficialId]);
                            }

                            _totalMarcosSuperficiasCarregados += 1;

                            if (_totalMarcosSuperficias == _totalMarcosSuperficiasCarregados) {
                                //if (undefined != req.param("tipo") && req.param("tipo") == "mapa") {
                                //    return resolve(_that._summarizeMonitoramentoMapa(_marcosSuperficiais, req));
                                //}

                                switch (req.param("tipo")) {
                                    case "mapa":
                                        return resolve(_that._summarizeMonitoramentoMapa(_marcosSuperficiais, req));
                                        break;

                                    case "relatorio":
                                        return resolve(_that._summarizeMonitoramentoRelatorio(_marcosSuperficiais, req));
                                        break;

                                    default:
                                        return resolve(_that._summarizeMonitoramento(_marcosSuperficiais,req));
                                }
                            }
                        });



                    }

                });
            };

            if (_that._alertas == undefined || _that._alertas.length == 0) {
                Alerta.find({}, function (err, alertas) {
                    _that._alertas = alertas;
                    _that._setAlertasAceitavelRegular();
                    _monitoramentos();
                });
            } else {
                _that._setAlertasAceitavelRegular();
                _monitoramentos();
            }

        });

        execute.then(function (results) {
            res.json(results);
        });
    },

    searchbyname: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }

        MarcoSuperficial.find(filtro)
		.populate('aterro')
		.populate('usuario')
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        res.json(ret);
		    }
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


        MarcoSuperficial.find(filtro)
		.populate('aterro')
		.populate('usuario')
        .sort('nome asc')
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


        MarcoSuperficial.count(filtro)
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    } else {
		        res.json(ret);
		    }
		});
    }
};

