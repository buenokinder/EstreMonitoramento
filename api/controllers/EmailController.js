/**
 * EmailController
 *
 * @description :: Server-side logic for managing Piezometroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    
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
    },

    sendMarcoSuperficial: function (req, res) {

        sails.hooks.email.send(
            "alertaalteracaomarcosuperficial",
        {
            data: getDateTimeString(new Date()),
            link: "http://localhost:1337",
        },
        {
            to: req.param('emails'),
            subject: "(Geotecnia) Altera��o de Medi��o"
        },
        function (err) {
            console.log(err || "Email enviado!");
        });
    },

    sendAlteracaoPiezometro: function (req, res) {

        sails.hooks.email.send(
            "alertaalteracaopiezometro",
        {
            data: getDateTimeString(new Date()),
            link: "http://localhost:1337",
        },
        {
            to: req.param('emails'),
            subject: "(Geotecnia) Altera��o de Medi��o"
        },
        function (err) {
            console.log(err || "Email enviado!");
        });
    }


};


