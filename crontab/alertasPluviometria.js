module.exports = {

    _urlBase: sails.config.appconfig.url,
   
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

    _sendEmailGerenteAdministradorAterro: function (usuarios) {

        console.log("Enviando email de pluviometria para os gestores e administradores", usuarios);

        var emails = this._getEmailAdministrador(usuarios);
        emails.push(this._getEmailGerente(usuarios));
        var _that = this;

        sails.hooks.email.send(
            "alertapluviometria",
            {
                link: _that._urlBase,
                logo: _that._urlBase + "/images/logo_estre_xs.png",
            },
            {
                to: emails,
                subject: "(Geotecnia) Dados de Pluviometria"
            },
            function (err) { console.log(err || "Email enviado!"); }
        );
    },
   
    _inspectAterros: function (context, aterros) {
        for (var i = 0; i < aterros.length; i++) {
            context._sendEmailGerenteAdministradorAterro(aterros[i].usuarios);
        }
    },

    _listAterros: function (callback, calbackError) {
        var _that = this;
        var request = require('request');
        request(_that._urlBase + 'aterro/findall', function (error, response, body) {
            if (error || response.statusCode != 200) {
                calbackError(error);
            } else {
                var aterros = JSON.parse(body);
                callback(_that, aterros);
            }
        });
    },

    _logError: function (error) {
        console.log((new Date()).toString(), error);
    },

    run: function () {
       // this._listAterros(this._inspectAterros, this._logError);
    }
}