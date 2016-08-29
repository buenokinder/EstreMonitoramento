/**
 * AlertaController
 *
 * @description :: Server-side logic for managing Alertas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'name') {
                filtro.name = { 'contains': req.param('name') };
                continue;
            }

            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        Perfil.find(filtro)
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
            if (key == 'name') {
                filtro.name = { 'contains': req.param('name') };
                continue;
            }
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        Perfil.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    }

};

