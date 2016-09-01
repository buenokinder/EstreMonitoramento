
/**
 * MarcoSuperficialController
 *
 * @description :: Server-side logic for managing Marcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {
    _marcoSuperficiaisNotificacao: ([]),
    _marcosSuperficiais: ([]),
    _alertas: ([]),
    _aterros: ([]),
    _totalMarcosSuperficias: 0,
    _totalMarcosSuperficiasCarregados: 0,
    _rearrange: function (marcoSuperficiais) {

        var ret = [];
        var _extractOwners = function (medicoes) {

            var owners = {};
            for (var j = 0; j < medicoes.length; j++) {
                if (owners[medicoes[j].owner.id] == undefined) {
                    var owner = medicoes[j].owner;
                    owners[medicoes[j].owner.id] = owner;
                }
            }

            return owners;
        };

        for (var i = 0; i < marcoSuperficiais.length; i++) {

            var ms = { marcoSuperficial: marcoSuperficiais[i].marcoSuperficial, usuariosAterro: [], medicoes: [] };
            var owners = _extractOwners(marcoSuperficiais[i].medicoes);

            for (var item in owners) {
                var medicao = { id: owners[item].id, obsGestor: owners[item].obsGestor, notificacao: owners[item].notificacao, detalhes: [] };

                for (var j = 0; j < marcoSuperficiais[i].medicoes.length; j++) {

                    if (marcoSuperficiais[i].medicoes[j].owner == undefined) {
                        console.log("marcoSuperficiais[i].medicoes", marcoSuperficiais[i].medicoes[j]);
                    }

                    if (marcoSuperficiais[i].medicoes[j].owner.id == owners[item].id) {
                        var detalhe = { id: marcoSuperficiais[i].medicoes[j].id, nome: marcoSuperficiais[i].medicoes[j].nome, data: marcoSuperficiais[i].medicoes[j].data, criterioAlertaHorizontalMetodologia1: marcoSuperficiais[i].medicoes[j].criterioAlertaHorizontalMetodologia1, criterioAlertaVerticalMetodologia1: marcoSuperficiais[i].medicoes[j].criterioAlertaVerticalMetodologia1 };
                        medicao.detalhes.push(detalhe);
                    }
                }
                ms.medicoes.push(medicao);
            }

            for (var j = 0; j < marcoSuperficiais[i].usuariosAterro.length; j++) {
                var usuario = { name: marcoSuperficiais[i].usuariosAterro[j].name, email: marcoSuperficiais[i].usuariosAterro[j].email, perfil: marcoSuperficiais[i].usuariosAterro[j].perfil };
                ms.usuariosAterro.push(usuario);
            }

            ret.push(ms);
        }

        return ret;

    },

    _summarizeMonitoramentoNotificacao: function () {
        var result = [];
        var _that = this;


        var sortDateAsc = function (a, b) {
            if (a.data < b.data)
                return -1;
            if (a.data > b.data)
                return 1;

            return 0;
        }


        for (var item in this._marcoSuperficiaisNotificacao) {
            var marcoSuperficial = this._marcoSuperficiaisNotificacao[item];

            if (undefined == marcoSuperficial) continue;

            var first = true;

            marcoSuperficial.medicoes.sort(this.sortDateAsc);
            var ms = { marcoSuperficial: marcoSuperficial.nome, usuariosAterro: marcoSuperficial.usuariosaterro, medicoes: [] };


            for (var i = 0; i < marcoSuperficial.medicoes.length; i++) {
                var medicaoAtual = marcoSuperficial.medicoes[i];
                var medicaoAnterior = first ? marcoSuperficial : marcoSuperficial.medicoes[i - 1];

                var deltaParcialNorte = Math.pow((medicaoAtual.norte - medicaoAnterior.norte), 2);
                var deltaParcialEste = Math.pow((medicaoAtual.leste - medicaoAnterior.leste), 2);

                var dataAtual = Math.floor(medicaoAtual.data.getTime() / (3600 * 24 * 1000));
                var dataAnterior = Math.floor(medicaoAnterior.data.getTime() / (3600 * 24 * 1000));
                var diferencaDatas = dataAtual - dataAnterior;

                var deslocamentoVerticalParcial = parseFloat((medicaoAtual.cota - medicaoAnterior.cota) * 100).toFixed(4);
                var deslocamentoHorizontalParcial = parseFloat(Math.sqrt(deltaParcialNorte + deltaParcialEste) * 100).toFixed(4);
                var velocidadeHorizontal = (diferencaDatas == 0 ? 0 : parseFloat(deslocamentoHorizontalParcial / diferencaDatas).toFixed(4));
                var velocidadeVertical = (diferencaDatas == 0 ? 0 : parseFloat(Math.abs(deslocamentoVerticalParcial / diferencaDatas)).toFixed(4));


                for (k = 0; k < this._alertas.length; k++) {
                    if (velocidadeHorizontal > this._alertas[k].velocidade)
                        marcoSuperficial.medicoes[i].criterioAlertaHorizontalMetodologia1 = this._alertas[k].nivel;

                    if (velocidadeHorizontal > this._alertas[k].velocidade)
                        marcoSuperficial.medicoes[i].criterioAlertaVerticalMetodologia1 = this._alertas[k].nivel;
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

        return this._rearrange(result);
    },

    _summarizeMonitoramento: function (marcosSuperficiais) {

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
            item.criterioAlerta = null;
            item.deslocamentoVerticalParcial = null;
            item.deslocamentoVerticalTotal = null;
            item.sentidoDeslocamentoDirerencaNorte = null;
            item.sentidoDeslocamentoDirerencaEste = null;
            item.sentidoDeslocamentoNorteSul = null;
            item.sentidoDeslocamentoLesteOeste = null;
            item.sentido = null;
            item.nomeTopografo = null;
            item.nomeAuxiliar = null;
            item.criterioAlertaHorizontalMetodologia1 = null;
            item.criterioAlertaVerticalMetodologia1 = null;
            item.vetorDeslocamentoSeno = null;
            item.vetorDeslocamentoAngulo = null;

            item.aterro = { id: marcosSuperficiais[i].aterro.id, nome: marcosSuperficiais[i].aterro.nome };


            result.push(item);

            for (var j = 0; j < marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes.length; j++) {
                var detalhe = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j];
                var item = {};
                item.marcoSuperficial = marcosSuperficiais[i].nome;
                item.norte = detalhe.norte;
                item.leste = detalhe.leste;
                item.cota = detalhe.cota;
                item.data = detalhe.data
                item.nomeTopografo = detalhe.owner.nomeTopografo;
                item.temperatura = detalhe.owner.temperatura;
                item.nomeAuxiliar = detalhe.owner.nomeAuxiliar;
                item.deslocamentoHorizontalParcial = detalhe.monitoramento.deslocamentoHorizontalParcial;
                item.deslocamentoHorizontalTotal = detalhe.monitoramento.deslocamentoHorizontalTotal;
                item.velocidadeHorizontal = detalhe.monitoramento.velocidadeHorizontal;
                item.velocidadeVertical = detalhe.monitoramento.velocidadeVertical;
                item.criterioAlerta = detalhe.monitoramento.criterioAlerta;
                item.deslocamentoVerticalParcial = detalhe.monitoramento.deslocamentoVerticalParcial;
                item.deslocamentoVerticalTotal = detalhe.monitoramento.deslocamentoVerticalTotal;
                item.sentidoDeslocamentoDirerencaNorte = detalhe.monitoramento.sentidoDeslocamentoDirerencaNorte;
                item.sentidoDeslocamentoDirerencaEste = detalhe.monitoramento.sentidoDeslocamentoDirerencaEste;
                item.sentidoDeslocamentoNorteSul = detalhe.monitoramento.sentidoDeslocamentoNorteSul;
                item.sentidoDeslocamentoLesteOeste = detalhe.monitoramento.sentidoDeslocamentoLesteOeste;
                item.sentido = detalhe.monitoramento.sentido;
                item.criterioAlertaHorizontalMetodologia1 = detalhe.monitoramento.criterioAlertaHorizontalMetodologia1;
                item.criterioAlertaVerticalMetodologia1 = detalhe.monitoramento.criterioAlertaVerticalMetodologia1;
                item.vetorDeslocamentoSeno = detalhe.monitoramento.vetorDeslocamentoSeno;
                item.vetorDeslocamentoAngulo = detalhe.monitoramento.vetorDeslocamentoAngulo;

                var notificacao = ([]);

                //if(detalhe.owner.notificacoes.length>0){
                //    notificacao = detalhe.owner.notificacoes[0];
                //}

                item.medicaoMarcoSuperficial = { id: detalhe.owner.id, obsGestor: detalhe.owner.obsGestor, notificacao: detalhe.owner.notificacoes };


                result.push(item);
            }
        }

        return result;
    },

    _summarizeMonitoramentoMapa: function (marcosSuperficiais) {

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
                item.norte = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].norte;
                item.leste = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].leste;
                item.criterioAlertaHorizontalMetodologia1 = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaHorizontalMetodologia1;
                item.criterioAlertaVerticalMetodologia1 = marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes[j].monitoramento.criterioAlertaVerticalMetodologia1;
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

    _joinMedicoesDetalhesNotificacoes: function (detalhes, notificacoes) {
        for (var i = 0; i < detalhes.length; i++) {
            var exists = this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id] != undefined;

            if (!exists) {
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id] = {};
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].nome = detalhes[i].marcoSuperficial.nome;
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].leste = detalhes[i].marcoSuperficial.leste;
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].norte = detalhes[i].marcoSuperficial.norte;
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].cota = detalhes[i].marcoSuperficial.cota;
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].aterro = detalhes[i].marcoSuperficial.aterro;
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].data = new Date(detalhes[i].marcoSuperficial.dataInstalacao);
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].usuariosaterro = this._extractUsuariosAterro(detalhes[i].aterro);
                this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].medicoes = [];
            }

            var medicao = {
                id: detalhes[i].owner.id,
                obsGestor: detalhes[i].owner.obsGestor,
                notificacao: {}
            };

            if (notificacoes.length > 0) {
                medicao.notificacao.id = notificacoes[0].id;
                medicao.notificacao.status = notificacoes[0].status;
                medicao.notificacao.data = notificacoes[0].data;
            }

            var detalhe = {
                id: detalhes[i].id,
                nome: detalhes[i].nome,
                norte: detalhes[i].norte,
                leste: detalhes[i].leste,
                cota: detalhes[i].cota,
                data: new Date(detalhes[i].owner.data),
                criterioAlertaHorizontalMetodologia1: 'Aceitável',
                criterioAlertaVerticalMetodologia1: 'Aceitável',
                owner: medicao
            };
            this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].medicoes.push(detalhe);

            //var medicoes = this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].medicoes;
            //var encontrou = false;
            //for (var j = 0; j < medicoes.length; j++) {
            //    if (medicoes[j].id == detalhes[i].owner.id) {
            //        medicoes[j].detalhes.push(detalhe);
            //        encontrou = true;
            //        break;
            //    }
            //}

            //if (!encontrou) {
            //    var medicao = {
            //        id: detalhes[i].owner.id,
            //        obsGestor: detalhes[i].owner.obsGestor,
            //        data: new Date(detalhes[i].owner.data),
            //        usuariosaterro: this._extractUsuariosAterro(detalhes[i].aterro),
            //        notificacoes:notificacoes,
            //        detalhes:[]
            //    };

            //    medicao.detalhes.push(detalhe);
            //    medicoes.push(medicao);
            //}

            //this._marcoSuperficiaisNotificacao[detalhes[i].marcoSuperficial.id].medicoes = medicoes;
        }
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

    getFiltrosDetalhes: function (req) {

        var filtro = {};

        var dataInicial = new Date(new Date().setDate(new Date().getDate() - 30));
        var dataFinal = new Date();

        if (undefined != req.param('data') && '' != req.param('data')) {
            dt = req.param('data').split('-');
            dataInicial = this.getDate(req.param('data'), 0, 0, 0);
            dataFinal = this.getDate(req.param('data'), 23, 59, 59);

            filtro.data = { '>=': dataInicial, '<=': dataFinal };
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

    _loadMedicoesDetalhes: function (marcoSuperficialId) {

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

    _extractUsuariosAterro: function (aterro) {
        var ret = [];

        for (var i = 0; i < this._aterros.length; i++) {
            if (this._aterros[i].id == aterro.id) {
                ret = this._aterros[i].usuarios;
                break;
            }
        }

        return ret;
    },

    monitoramentosNotificacao: function (req, res) {
        var _that = this;

        var execute = new Promise(function (resolve, reject) {
            _that._totalMarcosSuperficias = 0;
            _that._marcoSuperficiaisNotificacao = ([]);
            _that._alertas = ([]);
            _that._aterros = ([]);

            Aterro.find({}).populate("usuarios").exec(function (err, aterros) {
                if (err) {
                    return resolve(err);
                }

                _that._aterros = aterros;
                Alerta.find({}, function (err, alertas) {
                    if (err) {
                        return resolve(err);
                    }

                    _that._alertas = alertas;

                    var executeMedicoes = new Promise(function (resolveMedicoes, rejectMedicoes) {

                        MedicaoMarcoSuperficial.find().populate("notificacoes").exec(function (err, result) {
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

                                    MedicaoMarcoSuperficialDetalhes.find(filtroDetalhes).populate("owner").populate("marcoSuperficial").populate("aterro").exec(function (err, detalhes) {
                                        if (err) {
                                            return resolve(err);
                                        }
                                        _that._joinMedicoesDetalhesNotificacoes(detalhes, medicoes[index].notificacoes);
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
                        return resolve(_that._summarizeMonitoramentoNotificacao());
                    });
                });

            });
        });

        execute.then(function (results) {
            res.json(results);
        });
    },

    monitoramentos: function (req, res) {
        var _that = this;

        var execute = new Promise(function (resolve, reject) {
            _that._totalMarcosSuperficias = 0;
            _that._totalMarcosSuperficiasCarregados = 0;
            _that._marcosSuperficiais = ([]);
            _that._alertas = ([]);

            Alerta.find({}, function (err, alertas) {
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

                        var filtroDetalhes = {};

                        if (undefined == req.param('skipdatefilter')) {
                            filtroDetalhes = _that.getFiltrosDetalhes(req);
                        }


                        filtroDetalhes.marcoSuperficial = marcosSuperficiais[i].id;
                        marcosSuperficiais[i].medicaoMarcoSuperficialDetalhes = [];
                        marcosSuperficiais[i].data = marcosSuperficiais[i].dataInstalacao;
                        _that._marcosSuperficiais[marcosSuperficiais[i].id] = marcosSuperficiais[i];

                        var sort = 'data Desc';
                        if (undefined != req.param('order') && (req.param('order').toLowerCase().indexOf("asc") >= 0)) {
                            sort = 'data Asc';
                        }

                        var f = { where: filtroDetalhes, sort: sort };

                        if (req.param('limitMedicoes') != undefined) {
                            f.limit = req.param('limitMedicoes');
                        }

                        MedicaoMarcoSuperficialDetalhes.find(f).populate("owner").exec(function (err, detalhes) {
                            //ret = _that._listDetalhesByOwnerDate(detalhes);
                            var possuiDetalhes = null != detalhes && undefined != detalhes && detalhes.length;
                            var marcoSuperficialId = possuiDetalhes ? detalhes[0].marcoSuperficial : '';

                            if (_that._marcosSuperficiais[marcoSuperficialId]) {
                                _that._marcosSuperficiais[marcoSuperficialId].medicaoMarcoSuperficialDetalhes = detalhes;
                                _that._loadMedicoesDetalhes(marcoSuperficialId);
                            }

                            _that._totalMarcosSuperficiasCarregados += 1;

                            if (_that._totalMarcosSuperficias == _that._totalMarcosSuperficiasCarregados) {
                                if (undefined != req.param("tipo") && req.param("tipo") == "mapa") {
                                    return resolve(_that._summarizeMonitoramentoMapa(_that._marcosSuperficiais));
                                }

                                return resolve(_that._summarizeMonitoramento(_that._marcosSuperficiais));
                            }
                        });
                    }

                });
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

