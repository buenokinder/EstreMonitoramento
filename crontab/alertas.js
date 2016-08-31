module.exports = {

//    - OBTER PRIMEIRO MEDICAOMARCOSUPERFICIAL
//	- OBTER OS DETALHES DA MEDICAO E PRA CADA UMA BUSCAR O NIVEL DE ALERTA

//ISSO, POIS O CONTROLE DE ENVIO DE EMAIL VAI FICAR MAIS SIMPLES, POIS O RETORNO DA API SERÁ 
//UMA LISTA DE MEDICOES E DENTRO DE CADA ITEM DA LISTA HAVERÁ OS DETALHES COM SEUS ALERTAS QUE SERÃO AGRUPADOS NO EMAIL.


    //1 - Pegar as notificações enviadas para a medição.
    //     - Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
    //     - Existe notificações > Sim > O Status está como pendente > Não > Finaliza a notificação;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Não > Fim;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
  
    _urlBase:'http://localhost:1337/',
    _notificacoes: {},
    _mustSendNotificacao: function (medicao) {
        return true;
        if (medicao.medicaoMarcoSuperficial == undefined) {
            return false;
        }

        if (undefined != medicao.medicaoMarcoSuperficial.obsGestor && null != medicao.medicaoMarcoSuperficial.obsGestor && medicao.medicaoMarcoSuperficial.obsGestor.length > 0) {
            return false;
        }

        return (medicao.criterioAlertaHorizontalMetodologia1 == 'Atenção' || medicao.criterioAlertaVerticalMetodologia1 == 'Atenção')
        || (medicao.criterioAlertaHorizontalMetodologia1 == 'Intervenção' || medicao.criterioAlertaVerticalMetodologia1 == 'Intervenção')
        || (medicao.criterioAlertaHorizontalMetodologia1 == 'Paralisação' || medicao.criterioAlertaVerticalMetodologia1 == 'Paralisação');
    },


    _getEmail: function (tipo, medicao) {
        var emails = [];

        for (var i = 0; i < medicao.aterro.usuarios; i++) {
            var usuario = medicao.aterro.usuarios[i];
            if (usuario.perfil == "Diretor") {
                emails.push(usuario.email);
            }
        }

        return emails;
    },

    _getEmailGerente: function (medicao) {
        return this._getEmail("Gerente", medicao);
    },

    _getEmailAdministrador: function (medicao) {
        return this._getEmail("Administrador", medicao);
    },

    _getEmailDiretor: function (medicao) {
        return this._getEmail("Diretor", medicao);
    },

    _existsNotificacao: function(medicao){

        if (undefined != medicao.noticacao && null != medicao.noticacao && medicao.noticacao.status) {
            return true;
        }

        if (this._notificacoes[medicao.medicaoMarcoSuperficial.id]!=undefined) {
            return true;
        }
        return false;
    },

    _createNoticacao: function (medicao) {
        var _that = this;
        var request = require('request');
        var body = {
            data: new Date(),
            owner: medicao.medicaoMarcoSuperficial.id,
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
            _that._notificacoes[medicao.medicaoMarcoSuperficial.id] = notificacao;
            medicao.notificacao = notificacao;
        })
    },

    _sendEmailResponsaveisAterro: function(medicao){
        var emails = this._getEmailDiretor(medicao);
        emails.push(this._getEmailAdministrador(medicao));
        emails.push(this._getEmailGerente(medicao));



        sails.hooks.email.send(
          "alertamedicaomarcosuperficial",
          {
              link: context._urlBase,
              medicoes: "",
              data: medicao.medicaoMarcoSuperficial.data
          },
          {
              to: "michel@coltrane.co",
              subject: "(Geotecnia) Notificação de Nível de Alerta"
          },
          function (err) { console.log(err || "Email enviado!"); }
        )

    },

    _sendEmailDiretor: function (medicao) {
        var emails = this._getEmailDiretor(medicao);
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
            var medicao = monitoramentos[i];
            
            if (!context._mustSendNotificacao(medicao)) {
                continue;
            }


            //Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
            if (context._existsNotificacao(medicao) == false) {
                context._notificacoes[medicao.medicaoMarcoSuperficial.id] = "";
                context._createNoticacao(medicao);
                continue;
            }
            
            //Existe notificações > Sim > O Status está como pendente > Não > Finaliza a notificação;
            if (medicao.notificacao == 'Finalizada') {
                continue;
            }

            if (context._notificacoes[medicao.medicaoMarcoSuperficial.id] && context._notificacoes[medicao.medicaoMarcoSuperficial.id] != "") {
                medicao.notificacao = context._notificacoes[medicao.medicaoMarcoSuperficial.id];
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
                if (undefined == medicao.medicaoMarcoSuperficial.obsGestor
                    || null == medicao.medicaoMarcoSuperficial.obsGestor
                    || medicao.medicaoMarcoSuperficial.obsGestor.length == 0) {

                    context._sendEmailResponsaveisAterro(medicao);
                    return false;
                }

                //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
                if (medicao.medicaoMarcoSuperficial.obsGestor != '') {
                    context._sendEmailDiretor(medicao);
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

