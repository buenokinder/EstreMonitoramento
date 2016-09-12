/**
 * AterroDashboard
 *
 * @description :: Server-side logic for managing Aterroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    visualizacao: function (req, res) {
        if (!req.session.me) {
            return res.view('index');
        }

        return res.view('monitoramento');
    },

    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        AterroDashboard.find(filtro)
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

        AterroDashboard.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    }

}