/**
 * EmailController
 *
 * @description :: Server-side logic for managing Piezometroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    _padLeftZero: function (value) {
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

        var retorno = this._padLeftZero(dia) + "/" + this._padLeftZero(mes) + "/" + ano + " " + this._padLeftZero(hora) + ":" + this._padLeftZero(minuto);

        return retorno;
    },

    sendMarcoSuperficial: function (req, res) {
        var _that = this;
        sails.hooks.email.send(
            "alertaalteracaomarcosuperficial",
        {
            data: _that._getDateTimeString(new Date(req.param('data'))),
            link: "http://localhost:1337",
        },
        {
            to: req.param('emails'),
            subject: "(Geotecnia) Alteração de Medição"
        },
        function (err) {
            res.send(err || "Email enviado");
        });
    },

    sendAlteracaoPiezometro: function (req, res) {
        var _that = this;
        sails.hooks.email.send(
            "alertaalteracaopiezometro",
        {
            data: _that._getDateTimeString(new Date(req.param('data'))),
            link: "http://localhost:1337",
        },
        {
            to: req.param('emails'),
            subject: "(Geotecnia) Alteração de Medição"
        },
        function (err) {
            res.send(err || "Email enviado");
        });
    }


};


