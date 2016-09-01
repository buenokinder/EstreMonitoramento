module.exports = {

    //1 - Pegar as notificações enviadas para a medição.
    //     - Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
    //     - Existe notificações > Sim > O Status está como pendente > Não > Finaliza a notificação;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Não > Fim;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
  
    _urlBase:'http://localhost:1337/',
    _notificacoes: {},
    _mustSendNotificacao: function (medicao) {

        if (medicao.notificacao.status == "Finalizada") {
            return false;
        }

        if (medicao.medicaoMarcoSuperficial == undefined) {
            return false;
        }

        if (undefined != medicao.obsGestor && null != medicao.obsGestor && medicao.obsGestor.length > 0) {
            return false;
        }

        return true;
        

        //return (medicao.criterioAlertaHorizontalMetodologia1 == 'Atenção' || medicao.criterioAlertaVerticalMetodologia1 == 'Atenção')
        //|| (medicao.criterioAlertaHorizontalMetodologia1 == 'Intervenção' || medicao.criterioAlertaVerticalMetodologia1 == 'Intervenção')
        //|| (medicao.criterioAlertaHorizontalMetodologia1 == 'Paralisação' || medicao.criterioAlertaVerticalMetodologia1 == 'Paralisação');
    },


    _getEmail: function (tipo, usuarios) {
        var emails = [];

        for (var i = 0; i < usuarios.length; i++) {
            var usuario = usuarios[i];
            if (usuario.perfil == "Diretor") {
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

    _existsNotificacao: function(medicao){

        if (undefined != medicao.noticacao && null != medicao.noticacao && medicao.noticacao.status) {
            return true;
        }

        if (this._notificacoes[medicao.id]!=undefined) {
            return true;
        }
        return false;
    },

    _createNoticacao: function (medicao) {
        var _that = this;
        var request = require('request');
        var body = {
            data: new Date(),
            owner: medicao.id,
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
                return;
            }
            _that._notificacoes[medicao.id] = notificacao;
            medicao.notificacao = notificacao;
        })
    },
    
    _padLeftZero: function(value) {
        return parseInt(value) < 10 ? "0" + value.toString() : value.toString();
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

        var retorno = "";
        if (parseInt(hora) == 0 && parseInt(minuto) == 0) {
            retorno = dia + "/" + mes + "/" + ano;
        } else {
            retorno = padLeftZero(dia) + "/" + padLeftZero(mes) + "/" + ano + " " + padLeftZero(hora) + ":" + padLeftZero(minuto);
        }

        return retorno;
    },

    _getEmailBody:function(detalhes){

        var body = "";

        for (var i = 0; i < detalhes.length; i++) {

            var mustSend = (detalhes[i].criterioAlertaHorizontalMetodologia1 == 'Atenção' || detalhes[i].criterioAlertaVerticalMetodologia1 == 'Atenção')
             || (detalhes[i].criterioAlertaHorizontalMetodologia1 == 'Intervenção' || detalhes[i].criterioAlertaVerticalMetodologia1 == 'Intervenção')
             || (detalhes[i].criterioAlertaHorizontalMetodologia1 == 'Paralisação' || detalhes[i].criterioAlertaVerticalMetodologia1 == 'Paralisação');

            if (mustSend) {
                body += "<p>";
                body += "<b>" + detalhes[i].nome + " - Alerta Horizontal: " + detalhes[i].criterioAlertaHorizontalMetodologia + " - Alerta Vertical: " + detalhes[i].criterioAlertaVerticalMetodologia1 + "</b>";
                body += "</p>";
            }
        }

        return body;

    },

    _sendEmailGerenteAdministrador: function (usuarios, detalhes) {
        var emails =  this._getEmailAdministrador(usuarios);
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;
        var body = this._getEmailBody(detalhes);

        if (body == "") return;

        for (var i = 0; i < emails.length; i++) {
            sails.hooks.email.send(
              "alertagerenteadministradormedicaomarcosuperficial",
              {
                  link: context._urlBase,
                  medicoes: body,
                  data: _that._getDateTimeString(medicao.medicaoMarcoSuperficial.data)
              },
              {
                  to: emails[i],
                  subject: "(Geotecnia) Notificação de Nível de Alerta"
              },
              function (err) { console.log(err || "Email enviado!"); }
            );

        }

    },

    _sendEmailGerenteAdministradorDiretor: function (usuarios, detalhes) {
        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;
        var body = this._getEmailBody(detalhes);

        if (body == "") return;

        for (var i = 0; i < emails.length; i++) {
            sails.hooks.email.send(
              "alertagerenteadministradordiretormedicaomarcosuperficial",
              {
                  link: context._urlBase,
                  medicoes: body,
                  data: _that._getDateTimeString(medicao.medicaoMarcoSuperficial.data)
              },
              {
                  to: emails[i],
                  subject: "(Geotecnia) Notificação de Nível de Alerta"
              },
              function (err) { console.log(err || "Email enviado!"); }
            );

        }

    },
    _sendEmailDiretor: function (usuariosAterro, observacoes) {
        var emails = this._getEmailDiretor(usuariosAterro);

        for (var i = 0; i < emails.length; i++) {
            sails.hooks.email.send(
              "alertadiretormedicaomarcosuperficial",
              {
                  link: context._urlBase,
                  observacoes: observacoes,
                  data: _that._getDateTimeString(medicao.medicaoMarcoSuperficial.data)
              },
              {
                  to: emails[i],
                  subject: "(Geotecnia) Notificação de Nível de Alerta"
              },
              function (err) { console.log(err || "Email enviado!"); }
            );
        }
    },

    _listMonitoramentos: function(callback, calbackError){
        var _that = this;
        var request = require('request');
        request(_that._urlBase + 'MarcoSuperficial/monitoramentosNotificacao', function (error, response, body) {
            if (error || response.statusCode != 200) {
                calbackError(error);
            } else {
                var medicoes = JSON.parse(body);
                callback(_that, medicoes);
            }
        });
    },

    _inspectMonitoramentos: function(context, monitoramentos){

        for (var i = 0; i < monitoramentos.length; i++) {
            for (var j = 0; j < monitoramentos.medicoes.length; j++) {

                var medicao = monitoramentos[i].medicoes[j];
                
                if (!context._mustSendNotificacao(medicao)) {
                    continue;
                }

                //Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
                if (context._existsNotificacao(medicao) == false) {
                    context._notificacoes[medicao.id] = "";
                    context._createNoticacao(medicao);
                    context._sendEmailGerenteAdministrador(monitoramentos[i].usuariosAterro, medicao.detalhes);
                    continue;
                }

                //Existe notificações > Sim > O Status está como pendente > Não > Finaliza a notificação;
                if (medicao.notificacao.status == 'Finalizada') {
                    continue;
                }

                if (context._notificacoes[medicao.id] && context._notificacoes[medicao.id] != "") {
                    medicao.notificacao = context._notificacoes[medicao.id];
                }

                if (medicao.notificacao) {//Pode ser que o request de criação de notificação ainda não tenha retornado.
                    //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Não > Fim;
                    var hoje = Math.floor((new Date()).getTime() / (3600 * 24 * 1000));
                    var dataMedicao = Math.floor(new Date(medicao.notificacao.data).getTime() / (3600 * 24 * 1000));
                    var diferencaDatas = hoje - dataMedicao;
                    if (diferencaDatas < 1) {
                        continue;
                    }

                    //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
                    if (undefined == medicao.obsGestor
                        || null == medicao.obsGestor
                        || medicao.obsGestor.length == 0) {

                        context._sendEmailGerenteAdministadorDiretor(monitoramentos[i].usuariosAterro, medicao.detalhes);
                        continue;
                    }

                    //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
                    if (medicao.obsGestor != '') {
                        context._sendEmailDiretor(monitoramentos[i].usuariosAterro, medicao.obsGestor);
                    }
                }

            }

        }
    },

    _logError:function(error){
        console.log((new Date()).toString() + " - erro ao obter a lista de monitoramentos", error);
    },

    run: function () {
        this._listMonitoramentos(this._inspectMonitoramentos, this._logError);
    }
}

