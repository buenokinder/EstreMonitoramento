/**
 * MedicaoMarcoSuperficialController
 *
 * @description :: Server-side logic for managing medicaomarcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }

            if (key == 'nomeTopografo') {
                filtro.nomeTopografo = { 'contains': req.param('nomeTopografo') };
                continue;
            }

            if (key == 'nomeAuxiliar') {
                filtro.nomeAuxiliar = { 'contains': req.param('nomeAuxiliar') };
                continue;
            }

            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }


        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {

            filtro.aterro = req.session.me.aterro.id;
        }

        MedicaoMarcoSuperficial.find(filtro)
        .populate('aterro')
        .populate('usuario')
        .populate('medicaoMarcoSuperficialDetalhes')
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
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }

            if (key == 'nomeTopografo') {
                filtro.nomeTopografo = { 'contains': req.param('nomeTopografo') };
                continue;
            }

            if (key == 'nomeAuxiliar') {
                filtro.nomeAuxiliar = { 'contains': req.param('nomeAuxiliar') };
                continue;
            }


            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }

        MedicaoMarcoSuperficial.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    },

    medicao: function (req, res) {

        var parameters = req.allParams();
        MarcoSuperficial.findOne({
            nome: parameters.nome
        }, function foundUser(err, marco) {
            if (err) {
                return res.negotiate(err);
            }
            if (!marco) {
                MarcoSuperficial.create({
                    nome: parameters.nome,
                    norte: parameters.norte,
                    leste: parameters.leste,
                    cota: parameters.cota,
                    aterro: parameters.aterro
                }, function userCreated(err, marcoSuperficial) {
                    if (err) {
                        return res.negotiate(err);
                    }
                    if (!marcoSuperficial) {

                    }
                });
            } else {
                MedicaoMarcoSuperficialDetalhes.create({
                    norte: parameters.norte,
                    leste: parameters.leste,
                    cota: parameters.cota,
                    marcoSuperficial: marco.id
                }, function userCreated(err, medicao) {
                    if (err) {
                        return res.negotiate(err);
                    }
                });
            }

        });

        res.json('Ok');
    }

};

