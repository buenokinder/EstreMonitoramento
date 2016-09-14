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

            var retorno =  this._padLeftZero(dia) + "/" + this._padLeftZero(mes) + "/" + ano + " " + this._padLeftZero(hora) + ":" + this._padLeftZero(minuto);

            return retorno;
        }
    },

    _urlBase: sails.config.appconfig.url,
    _notificacoes: {},
    _alertas: ['Atenção', 'Intervenção', 'Paralisação'],
    _emailsEnviados: {},

    _mustSendNotificacao: function (medicao) {

        //if (undefined != medicao.obsGestor && null != medicao.obsGestor && medicao.obsGestor.length > 0) {
        //    return false;
        //}


        if (medicao.notificacao && medicao.notificacao.status=="Finalizada") {
            return false;
        }

        
        if (this._alertas.indexOf(medicao.criterioAlertaRu) < 0) {
            return false;
        }

        return true;
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

    _setNotificacao:function(medicao){

        if (this._notificacoes[medicao.id] == undefined) {
            this._notificacoes[medicao.id] = medicao.notificacao;
        }
    },

    _existsNotificacao: function (medicao) {

        if (undefined != medicao.notificacao && null != medicao.notificacao && medicao.notificacao.status) {
            this._setNotificacao(medicao);
            return true;
        }

        if (this._notificacoes[medicao.id] != undefined) {
            return true;
        }
        return false;
    },

    _createNoticacao: function (item, callback) {

        //var item = { usuarios: monitoramentos[i].aterro.usuarios, medicao: medicao, body: body };

       // console.log("Criando notificação", item);

        var _that = this;
        var request = require('request');
        var body = {
            data: new Date(),
            owner: item.medicao.id,
            emailgerenteadmin:false,
            emailgerenteadmindiretor:false,
            emaildiretor:false,
            status: 'Pendente'
        };

        var options = {
            method: 'post',
            body: body,
            json: true,
            url: _that._urlBase + 'MedicaoPiezometroNotificacao/'
        };

        console.log("options", options);

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
        console.log("Finalizando notificação", medicao);
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
            url: _that._urlBase + 'MedicaoPiezometroNotificacao/' + medicao.notificacao.id
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

        console.log("Atualizando notificação", medicao);

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
            url: _that._urlBase + 'MedicaoPiezometroNotificacao/' + medicao.notificacao.id
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

    _sendEmailGerenteAdministrador: function (usuarios, medicao, body) {
        console.log("_sendEmailGerenteAdministrador", medicao);

        var emails = this._getEmailAdministrador(usuarios);
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;

        sails.hooks.email.send(
            "alertagerenteadministradormedicaopiezometro",
            {
                link: _that._urlBase,
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
                    console.log("medicao - _sendEmailGerenteAdministrador", medicao);
                    medicao.notificacao.emailgerenteadmin = true;
                    _that._updateNoticacao(medicao);
                }

            }
        );
    },

    _sendEmailGerenteAdministradorDiretor: function (usuarios, medicao, body) {

        console.log("_sendEmailGerenteAdministradorDiretor", medicao);

        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;

        sails.hooks.email.send(
            "alertagerenteadministradordiretormedicaopiezometro",
            {
                link: _that._urlBase,
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
                    console.log("medicao - _sendEmailGerenteAdministradorDiretor", medicao);
                    medicao.notificacao.emailgerenteadmindiretor = true;
                    _that._updateNoticacao(medicao);
                }
            }
        );
    },

    _sendEmailDiretor: function (usuarios, medicao, observacoes) {
        console.log("_sendEmailGerenteAdministradorDiretor", medicao);

        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));
        var _that = this;

        sails.hooks.email.send(
            "alertadiretormedicaopiezometro",
            {
                link: _that._urlBase,
                observacoes: observacoes,
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
                    console.log("medicao - _sendEmailDiretor", medicao);
                    medicao.notificacao.emaildiretor = true;
                    _that._updateNoticacao(medicao);
                }
            }
        );
    },

    _listMonitoramentos: function (callback, calbackError) {
        var _that = this;
        var request = require('request');
        request(_that._urlBase + 'piezometro/monitoramentosnotificacao', function (error, response, body) {
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
            for (var j = 0; j < monitoramentos[i].medicoes.length; j++) {
                
                var medicao = monitoramentos[i].medicoes[j];

                if (!context._mustSendNotificacao(medicao)) {
                    continue;
                }
                
                var body = monitoramentos[i].nome + " - " + medicao.criterioAlertaRu;

                //Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
                if (context._existsNotificacao(medicao) == false) {
                    medicao.notificacao = { data: new Date(), emailgerenteadmin: false, emailgerenteadmindiretor: false, emaildiretor: false };
                    context._notificacoes[medicao.id] = { data: new Date(), emailgerenteadmin: false, emailgerenteadmindiretor: false, emaildiretor: false };
                    
                    var item = { usuarios: monitoramentos[i].aterro.usuarios, medicao: medicao, body: body };

                    context._createNoticacao(item, function (err, ret) {
                        if (err) return;

                        ///*************************
                        //AO CRIAR A NOTIFICAÇÃO JÁ FAZER OS 3 PASSOS A SEGUIR, ASSIM ELIMINA O CALLBACK.
                        ///*************************
                        if (context._sentEmailToday(ret.medicao, "GA") == false && ret.medicao.notificacao.emailgerenteadmin == false) {
                            context._sendEmailGerenteAdministrador(ret.usuarios, ret.medicao, ret.body);
                            context._setEmailEnviado(ret.medicao, "GA");
                        } 
                    });

                    continue;
                }

                //Existe notificações > Sim > O Status está como pendente > Não > Fim;
                //if (medicao.notificacao.status == 'Finalizada') {
                //    continue;
                //}

                var notificacaoFoiCriadaNessaInteracao = context._notificacoes[medicao.id].data > dataBase;

                if (notificacaoFoiCriadaNessaInteracao) {
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
                    var preencheuObs = (undefined != medicao.obsGestor && null != medicao.obsGestor && medicao.obsGestor.length > 0);

                    //Existe notificações > Sim > O Status está como pendente > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento
                    if (preencheuObs) {
                        if (context._sentEmailToday(medicao, "D") == false && medicao.notificacao.emaildiretor == false) {
                            context._sendEmailDiretor(monitoramentos[i].aterro.usuarios, medicao, medicao.obsGestor);
                            context._closeNoticacao(medicao);
                            context._setEmailEnviado(medicao, "D");
                        }
                    }
                    else {
                        //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
                        if (diferencaDatas >= 1) {
                            if (context._sentEmailToday(medicao, "GAD") == false && medicao.notificacao.emailgerenteadmindiretor == false) {
                                context._sendEmailGerenteAdministradorDiretor(monitoramentos[i].aterro.usuarios, medicao, body);
                                context._setEmailEnviado(medicao, "GAD");
                                continue;
                            }

                        }
                    }
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

