/**
 * MedicaoPiezometroNotificacao
 *
 * @description :: Server-side logic for managing medicaomarcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        MedicaoPiezometroNotificacao.find(filtro)
        .populate('owner')
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
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        MedicaoPiezometroNotificacao.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    }

};

