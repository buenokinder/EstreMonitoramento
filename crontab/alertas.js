module.exports = {

    //1 - Pegar as notificações enviadas para a medição.
    //     - Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
    //     - Existe notificações > Sim > O Status está como pendente > Não > Finaliza a notificação;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Não > Fim;
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
    //     - Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento

    _mustSendNotificacao: function (medicao) {
        if (undefined != medicao.medicaoMarcoSuperficial.obsGestor && null != medicao.medicaoMarcoSuperficial.obsGestor && medicao.medicaoMarcoSuperficial.obsGestor.length > 0) {
            return false;
        }

        return (medicao.criterioAlertaHorizontalMetodologia1 == 'Atenção' || medicao.criterioAlertaVerticalMetodologia1 == 'Atenção')
        || (medicao.criterioAlertaHorizontalMetodologia1 == 'Intervenção' || medicao.criterioAlertaVerticalMetodologia1 == 'Intervenção')
        || (medicao.criterioAlertaHorizontalMetodologia1 == 'Paralisação' || medicao.criterioAlertaVerticalMetodologia1 == 'Paralisação');
    },

    _getEmailGerente: function (medicao) {
        return "michel.oliveira@sennit.com.br";
    },


    _getEmailAdministrador: function (medicao) {
        return "michel.oliveira@sennit.com.br";
    },


    _getEmailDiretor: function (medicao) {
        return "michel.oliveira@sennit.com.br";
    },

    _getSendDate:function(){
        var hoje = new Date();

        return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
    },

    _getNotificacao: function(medicao){

    },

    _createNoticacao: function(medicao){

    },

    sendNotification: function (medicao) {
        //Obter o gerente atraves da medição
        //Obter o link da medicao
        //enviar
    },

    _containsNotificacao:function(medicao){
        return medicao.noticacoes.length > 0;
    },

    _listMonitoramentos: function(callback, calbackError){

        var request = require('request');
        request('/MarcoSuperficial/monitoramentos/?skipdatefilter=true', function (error, response, body) {
            if (error || response.statusCode != 200) {
                calbackError(error);
            } else {
                var medicoes = JSON.parse(body);
                callback(medicoes);
            }
        });
    },

    _inspectMonitoramentos: function(monitoramentos){

        for (var i = 0; i < monitoramentos.length; i++) {
            var medicao = monitoramentos[i];

            if (this._mustSendNotificacao(medicao)) {

                //Existe notificações > Não
                if (this._containsNotificacao(medicao) == false) {
                    //Cria uma notificação, gravando a medição e a data de hoje;
                    this._createNoticacao(medicao);
                } else {
                    //Existe notificações > Sim > 

                    //O Status está como pendente > Não > Finaliza a notificação;


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

