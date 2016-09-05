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

    _urlBase: 'http://localhost:1337/',
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

        var mustSend = (this._alertas.indexOf(medicao.criterioAlertaRu) >= 0);
        if (mustSend) {
            return true;
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
            url: _that._urlBase + 'MedicaoPiezometroNotificacao/'
        };

        request(options, function (err, res, notificacao) {
            if (err) {
                console.log("erro ao criar a notificacao", err);
                _that._logError(err);
                return;
            }
            console.log("sucesso ao criar a notificacao", notificacao);
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
                console.log("erro ao atualizar a notificacao", err);
                _that._logError(err);
                return;
            }
            console.log("sucesso ao atualizar a notificacao", notificacao);
            _that._notificacoes[medicao.id] = notificacao;
            medicao.notificacao = notificacao;
        })
    },

    _sendEmailGerenteAdministrador: function (usuarios, data, body) {
        var emails = this._getEmailAdministrador(usuarios);
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;

        console.log("enviando email para", emails);

        sails.hooks.email.send(
            "alertagerenteadministradormedicaopiezometro",
            {
                link: _that._urlBase,
                medicoes: body,
                data: _that.Utils._getDateTimeString(data)
            },
            {
                to: emails,
                subject: "(Geotecnia) Notificação de Nível de Alerta"
            },
            function (err) { console.log(err || "Email enviado!"); }
        );

        //for (var i = 0; i < emails.length; i++) {
            

        //}

    },

    _sendEmailGerenteAdministradorDiretor: function (usuarios, data, body) {
        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;

        console.log("enviando email para", emails);

        sails.hooks.email.send(
            "alertagerenteadministradordiretormedicaopiezometro",
            {
                link: _that._urlBase,
                medicoes: body,
                data: _that.Utils._getDateTimeString(data)
            },
            {
                to: emails,
                subject: "(Geotecnia) Notificação de Nível de Alerta"
            },
            function (err) { console.log(err || "Email enviado!"); }
        );


    },

    _sendEmailDiretor: function (usuarios, data, observacoes) {
        var emails = this._getEmailDiretor(usuarios);
        emails.push(this._getEmailAdministrador(usuarios));
        console.log("enviando email para", emails);
        var _that = this;

        sails.hooks.email.send(
            "alertadiretormedicaopiezometro",
            {
                link: _that._urlBase,
                observacoes: observacoes,
                data: _that.Utils._getDateTimeString(data)
            },
            {
                to: emails,
                subject: "(Geotecnia) Notificação de Nível de Alerta"
            },
            function (err) { console.log(err || "Email enviado!"); }
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
                    console.log("Nao enviar notificacao");
                    continue;
                }

                console.log("enviar notificacao");
                var body = monitoramentos[i].nome + " - " + medicao.criterioAlertaRu;

                //Existe notificações > Não > Cria uma notificação, gravando a medição e a data de hoje;
                if (context._existsNotificacao(medicao) == false) {
                    console.log("não existe notificacao");
                    //context._notificacoes[medicao.id] = "";
                    context._notificacoes[medicao.id] = { data: new Date() };
                    console.log("criando notificacao");
                    context._createNoticacao(medicao);

                    console.log("enviando email para o gerente e administrador");
                    if (context._sentEmailToday(medicao, "GA") == false) {
                        context._sendEmailGerenteAdministrador(monitoramentos[i].aterro.usuarios, medicao.data, body);
                        context._setEmailEnviado(medicao, "GA");
                    } else {
                        console.log("email para o gerente e administrador já foi enviado hoje.");
                    }

                    continue;
                }

                //Existe notificações > Sim > O Status está como pendente > Não > Fim;
                //if (medicao.notificacao.status == 'Finalizada') {
                //    continue;
                //}

                var notificacaoFoiCriadaNessaInteracao = context._notificacoes[medicao.id].data > dataBase;
                if (notificacaoFoiCriadaNessaInteracao) {
                    console.log("notificacaoFoiCriadaNessaInteracao", notificacaoFoiCriadaNessaInteracao);
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
                    console.log("diferencaDatas", diferencaDatas);

                    if (diferencaDatas < 1) {
                        continue;
                    }

                    //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Não > Notifica o Diretor, Administrador e Gerente
                    if (undefined == medicao.obsGestor
                        || null == medicao.obsGestor
                        || medicao.obsGestor.length == 0) {

                        if (context._sentEmailToday(medicao,"GAD") == false) {
                            console.log("enviando email para o gerente, administrador e diretor");
                            
                            context._sendEmailGerenteAdministradorDiretor(monitoramentos[i].aterro.usuarios, medicao.data, body);
                            context._setEmailEnviado(medicao, "GAD");
                            continue;
                        }

                        console.log("email para o gerente, administrador e diretor já foi enviado hoje.");
                    }
                    else { //Existe notificações > Sim > O Status está como pendente > Sim > Já se passou mais do que 1 dia do envio do envio da notificação > Sim > Gerente preencheu a observação > Sim > Notifica o Diretor sobre o preenchimento

                        if (context._sentEmailToday(medicao, "D") == false) {
                            console.log("enviando email para o diretor");
                            context._sendEmailDiretor(monitoramentos[i].aterro.usuarios, medicao.data, medicao.obsGestor);
                            context._updateNoticacao(medicao);
                            context._setEmailEnviado(medicao, "D");
                        } else {
                            console.log("email para o diretor já foi enviado hoje.");
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

