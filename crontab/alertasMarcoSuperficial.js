module.exports = {

    Utils: {

        _padLeftZero: function (value) {
            return parseInt(value) < 10 ? "0" + value.toString() : value.toString();
        },

        _getDateString: function (value) {
            var data = new Date(value);
            var ano = data.getFullYear();
            var mes = data.getMonth() + 1;
            var dia = data.getDate();

            if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
                return value;
            }

            var retorno = ano + mes + dia;

            return retorno;
        },

        _getDateTimeString: function (value) {
            var data = new Date(value);
            var ano = data.getFullYear();
            var mes = data.getMonth() + 1;
            var dia = data.getDate();
            var hora = data.getHours();
            var minuto = data.getMinutes()

            if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
                return value;
            }

            var retorno = this._padLeftZero(dia) + "/" + this._padLeftZero(mes) + "/" + ano + " " + this._padLeftZero(hora) + ":" + this._padLeftZero(minuto);

            return retorno;
        }
    },

    //1 - Pegar as notificações enviadas para a medição.
    //     - Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
    //     - Existe notificações > Sim > O Status está como pendente > Não > Finaliza a notificação;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Não > Fim;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
    _urlBase: sails.config.appconfig.url,
    _notificacoes: {},
    _alertas: ['Atenção', 'Intervenção', 'Paralisação'],
    _emailsEnviados: {},
    _mustSendNotificacao: function (medicao) {

        if (medicao.notificacao && medicao.notificacao.status != undefined && medicao.notificacao.status == "Finalizada") {
            return false;
        }

        //if (undefined != medicao.obsGestor && null != medicao.obsGestor && medicao.obsGestor.length > 0) {
        //    return false;
        //}
  
        for (var i = 0; i < medicao.detalhes.length; i++) {
            var detalhe = medicao.detalhes[i];
            var mustSend = (this._alertas.indexOf(detalhe.criterioAlertaHorizontalMetodologia1) >= 0) || (this._alertas.indexOf(detalhe.criterioAlertaVerticalMetodologia1) >= 0);
            if (mustSend) {
                return true;
            }
        }

        return false;
    },

    _getEmail: function (tipo, usuarios) {
        var emails = [];

        for (var i = 0; i < usuarios.length; i++) {
            var usuario = usuarios[i];
            if (usuario.perfil == tipo) {
                emails.push(usuario.email);
            }
        }

        return emails;
    },

    _getEmailGerente: function (usuarios) {
        return this._getEmail("Gerente", usuarios);
    },

    _getEmailAdministrador: function (usuarios) {
        return this._getEmail("Administrador", usuarios);
    },

    _getEmailDiretor: function (usuarios) {
        return this._getEmail("Diretor", usuarios);
    },

    _existsNotificacao: function (medicao) {

        if (undefined != medicao.notificacao && null != medicao.notificacao && medicao.notificacao.status) {

            if (this._notificacoes[medicao.id] == undefined) {
                this._notificacoes[medicao.id] = medicao.notificacao;
            }
            return true;
        }

        if (this._notificacoes[medicao.id] != undefined) {
            return true;
        }
        return false;
    },

    _createNoticacao: function (item, callback) {
        var _that = this;
        var request = require('request');
        var body = {
            data: new Date(),
            owner: item.medicao.id,
            status: 'Pendente'
        };

        var options = {
            method: 'post',
            body: body,
            json: true,
            url: _that._urlBase + 'MedicaoMarcoSuperficialNotificacao/'
        };

        request(options, function (err, res, notificacao) {
            if (err) {
                _that._logError(err);
                callback(err);
                return;
            }
            if (notificacao != undefined) {
                _that._notificacoes[item.medicao.id] = notificacao;
                item.medicao.notificacao = notificacao;
                callback(undefined, item);
            }
        })
    },

    _closeNoticacao: function (medicao) {
        var _that = this;
        var request = require('request');
        var body = {
            data: new Date(),
            owner: medicao.id,
            status: 'Finalizada',
            id: medicao.notificacao.id
        };

        var options = {
            method: 'put',
            body: body,
            json: true,
            url: _that._urlBase + 'MedicaoMarcoSuperficialNotificacao/' + medicao.notificacao.id
        };

        request(options, function (err, res, notificacao) {
            if (err) {
                _that._logError(err);
                return;
            }
            _that._notificacoes[medicao.id] = notificacao;
            medicao.notificacao = notificacao;
        })
    },

    _updateNoticacao: function (medicao) {
        var _that = this;
        var request = require('request');
        var body = {
            data: new Date(),
            owner: medicao.id,
            emailgerenteadmin: medicao.notificacao.emailgerenteadmin,
            emailgerenteadmindiretor: medicao.notificacao.emailgerenteadmindiretor,
            emaildiretor: medicao.notificacao.emaildiretor,
            id: medicao.notificacao.id
        };

        var options = {
            method: 'put',
            body: body,
            json: true,
            url: _that._urlBase + 'MedicaoMarcoSuperficialNotificacao/' + medicao.notificacao.id
        };

        console.log("Atualizando o status da notificação relacionada à medição:", body);

        request(options, function (err, res, notificacao) {
            if (err) {
                _that._logError(err);
                return;
            }
            _that._notificacoes[medicao.id] = notificacao;
            medicao.notificacao = notificacao;
        })
    },

    _formatHtml: function (text) {
        var style = "";

        switch (text) {
            case "Atenção":
                style = "background-color:#ff9e00;color:#000";
                break;

            case "Intervenção":
                style = "background-color:#ff0000;color:#000";
                break;

            case "Paralisação":
                style = "background-color:#000;color:#fff";
                break;
        }

        return "<span style="+style+">"+text+"</span>";

    },

    _getEmailBody: function (detalhes) {

        var body = "";

        for (var i = 0; i < detalhes.length; i++) {

            var mustSend = (this._alertas.indexOf(detalhes[i].criterioAlertaHorizontalMetodologia1) >= 0) || (this._alertas.indexOf(detalhes[i].criterioAlertaVerticalMetodologia1) >= 0);

            if (mustSend) {
                body += "<b>" + detalhes[i].nome + "</b> - Alerta Horizontal: " + this._formatHtml(detalhes[i].criterioAlertaHorizontalMetodologia1) + " - Alerta Vertical: " + this._formatHtml(detalhes[i].criterioAlertaVerticalMetodologia1) + " <br>";
            }
        }

        return body;

    },

    _sendEmailGerenteAdministrador: function (aterro, usuarios, medicao) {
        var emails = this._getEmailAdministrador(usuarios);
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;
        var body = this._getEmailBody(medicao.detalhes);

        if (body == "") return;

        sails.hooks.email.send(
            "alertagerenteadministradormedicaomarcosuperficial",
            {
                link: _that._urlBase,
                logo: _that._urlBase + "/images/logo_estre_xs.png",
                aterro:aterro,
                medicoes: body,
                data: _that.Utils._getDateTimeString(medicao.data)
            },
            {
                to: emails,
                subject: "(Geotecnia) Notificação de Nível de Alerta"
            },
            function (err) {
                if (err) {
                    console.log("err", err);
                } else {
                    medicao.notificacao.emailgerenteadmin = true;

                    _that._updateNoticacao(medicao);
                }

            }
        );
    },

    _sendEmailGerenteAdministradorDiretor: function (aterro, usuarios, medicao) {
        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;
        var body = this._getEmailBody(medicao.detalhes);
        if (body == "") return;


        sails.hooks.email.send(
            "alertagerenteadministradordiretormedicaomarcosuperficial",
            {
                link: _that._urlBase,
                logo: _that._urlBase + "/images/logo_estre_xs.png",
                aterro: aterro,
                medicoes: body,
                data: _that.Utils._getDateTimeString(medicao.data)
            },
            {
                to: emails,
                subject: "(Geotecnia) Notificação de Nível de Alerta"
            },
            function (err) {
                if (err) {
                    console.log("err", err);
                } else {
                    medicao.notificacao.emailgerenteadmindiretor = true;
                    _that._updateNoticacao(medicao);
                }
            }
        );
    },

    _sendEmailDiretor: function (aterro, usuarios, medicao) {
        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));


        sails.hooks.email.send(
            "alertadiretormedicaomarcosuperficial",
            {
                link: _that._urlBase,
                logo: _that._urlBase + "/images/logo_estre_xs.png",
                aterro: aterro,
                observacoes: medicao.obsGestor,
                data: _that.Utils._getDateTimeString(medicao.data)
            },
            {
                to: emails,
                subject: "(Geotecnia) Notificação de Nível de Alerta"
            },
            function (err) {
                if (err) {
                    console.log("err", err);
                } else {
                    medicao.notificacao.emaildiretor = true;
                    _that._updateNoticacao(medicao);
                }
            }
        );
    },

    _listMonitoramentos: function (callback, calbackError) {
        var _that = this;
        var request = require('request');
        request(_that._urlBase + 'marcosuperficial/monitoramentosnotificacao', function (error, response, body) {
            if (error || response.statusCode != 200) {
                calbackError(error);
            } else {
                var medicoes = JSON.parse(body);
                callback(_that, medicoes);
            }
        });
    },

    _sentEmailToday: function (medicao, tipo) {
        var key = medicao.id + "|" + this.Utils._getDateString(new Date()) + "|" + tipo;
        return (this._emailsEnviados[key] != undefined);
    },

    _setEmailEnviado: function (medicao, tipo) {
        var key = medicao.id + "|" + this.Utils._getDateString(new Date()) + "|" + tipo;
        this._emailsEnviados[key] = true;
    },

    _inspectMonitoramentos: function (context, monitoramentos) {
        var dataBase = new Date();
      

        for (var i = 0; i < monitoramentos.length; i++) {

            var medicao = monitoramentos[i].medicoes;

            if (!context._mustSendNotificacao(medicao)) {
                continue;
            }

            //Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
            if (context._existsNotificacao(medicao) == false) {
                //context._notificacoes[medicao.id] = "";
                context._notificacoes[medicao.id] = { data: new Date(), emailgerenteadmin: false, emailgerenteadmindiretor: false, emaildiretor: false };

                var item = { aterro: monitoramentos[i].aterro, usuariosAterro: monitoramentos[i].usuariosAterro, medicao: medicao };

                context._createNoticacao(item, function (err, ret) {
                    if (err) return;

                    if (context._sentEmailToday(ret.medicao, "GA") == false && ret.medicao.notificacao.emailgerenteadmin == false) {
                        context._sendEmailGerenteAdministrador(ret.aterro, ret.usuariosAterro, ret.medicao);
                        context._setEmailEnviado(ret.medicao, "GA");
                    }
                });

                continue;
            } 

            ////Existem notificações > Sim > O Status está como pendente > Não > Fim;
            //if (medicao.notificacao.status == 'Finalizada') {
            //    continue;
            //}


            if (context._notificacoes[medicao.id] && context._notificacoes[medicao.id] != "") {

                var notificacaoFoiCriadaNessaInteracao = context._notificacoes[medicao.id].data > dataBase;
                if (notificacaoFoiCriadaNessaInteracao) {
                    continue;
                }


                medicao.notificacao = context._notificacoes[medicao.id];
            }

            if (medicao.notificacao && medicao.notificacao.status) {//Pode ser que o request de criação de notificação ainda não tenha retornado.
                var hoje = Math.floor((new Date()).getTime() / (3600 * 24 * 1000));
                var dataMedicao = Math.floor(new Date(medicao.notificacao.data).getTime() / (3600 * 24 * 1000));
                var diferencaDatas = hoje - dataMedicao;
                var preencheuObs = (undefined != medicao.obsGestor && null != medicao.obsGestor && medicao.obsGestor.length > 0);

                //Existe notificações > Sim > O Status está como pendente > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
                if (preencheuObs) {

                    if (context._sentEmailToday(medicao, "D") == false && medicao.notificacao.emaildiretor == false) {
                        context._sendEmailDiretor(monitoramentos[i].aterro, monitoramentos[i].usuariosAterro, medicao);
                        context._closeNoticacao(medicao);
                        context._setEmailEnviado(medicao, "D");
                    }
                } else {
                    //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
                    if (diferencaDatas >= 1) {
                        if (context._sentEmailToday(medicao, "GAD") == false && medicao.notificacao.emailgerenteadmindiretor == false) {
                            context._sendEmailGerenteAdministradorDiretor(monitoramentos[i].aterro, monitoramentos[i].usuariosAterro, medicao);
                            context._setEmailEnviado(medicao, "GAD");
                        }
                    } //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Não > Fim;
                }
            }

        }
    },

    _logError: function (error) {
        console.log((new Date()).toString() + " - erro ao obter a lista de monitoramentos", error);
    },

    run: function () {
        this._listMonitoramentos(this._inspectMonitoramentos, this._logError);
    }
}

