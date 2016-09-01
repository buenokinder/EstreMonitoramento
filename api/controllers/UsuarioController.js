/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Promise = require('bluebird');
var Passwords = require('machinepack-passwords');
var Gravatar = require('machinepack-gravatar');

module.exports = {

    _totalRequests: 0,
    _totalResponses: 0,
    _ret: { errors: [], sucess: [] },

    _findOrCreateAlerta: function (alerta) {
        var _that = this;

        Alerta.findOne({
            nivel: alerta.nivel
        }).exec(function (err, alertaRet) {
            _that._totalResponses += 1;

            if (err) {
                _that._ret.errors.push(err);
            }
            else {
                if (!alertaRet) {
                    Alerta.create(alerta).exec(function (err, alertas) {
                        if (err) {
                            _that._ret.errors.push(err);
                        } else {
                            _that._ret.sucess.push(alertas);
                        }
                    });
                }
            }
        });
    },

    setup: function (req, res) {

        var _that = this;

        var execute = new Promise(function (resolve, reject) {

            var niveis = {
                "Aceitável": { nivel: "Aceitável", criterios: "Estável", velocidade: "0.25", periodicidade: "Semanal" },
                "Regular": { nivel: "Regular", criterios: "Estável", velocidade: "1", periodicidade: "Semanal" },
                "Atenção": { nivel: "Atenção", criterios: "Verificação \"in situ\" de eventuais problemas", velocidade: "4", periodicidade: "2 dias" },
                "Intervenção": { nivel: "Intervenção", criterios: "Paralisação imediata das operações no aterro e intervençães localizadas", velocidade: "14", periodicidade: "Diária" },
                "Paralisação": { nivel: "Paralisação", criterios: "Definição de estado de alerta, paralisação imediata das operaçães, acionamento da Defesa Civil para as providências cabíveis", velocidade: "14.01", periodicidade: "Diária" }
            };

            for (var nivel in niveis) {
                _that._totalRequests += 1;
                _that._findOrCreateAlerta(niveis[nivel]);
            }

            var itv = setInterval(function () {
                if (_that._totalRequests == _that._totalResponses) {
                    return resolve(_that._ret);
                    clearInterval(itv);
                }
            }, 10);

        });

        execute.then(function (results) {
            res.json(results);
        });

    },

    login: function (req, res) {

        // Usuario.find().populate('aterro').exec(function(err, users) {
        //     console.log(users);

        // })

        Usuario.findOne({
            email: req.param('email')
        }).populate('aterros').exec(function foundUser(err, user) {
            if (err) return res.negotiate(err);
            if (!user) return res.notFound();

            require('machinepack-passwords').checkPassword({
                passwordAttempt: req.param('password'),
                encryptedPassword: user.encryptedPassword
            }).exec({

                error: function (err) {
                    return res.negotiate(err);
                },

                incorrect: function () {
                    return res.notFound();
                },

                success: function () {
                    req.session.me = user;
                    req.session.me.perfil = user.perfil;
                    req.session.name = user.name;
                    if (user.aterros.length > 0) {
                        req.session.me.aterro = user.aterros[0];
                    }
                    else
                        req.session.me.aterro = "";

                    return res.ok();
                }
            });
        });

    },


    signup: function (req, res) {

        Usuario.create({
            name: req.param('name'),
            email: req.param('email'),
            perfil: req.param('perfil'),
            password: req.param('password'),
            lastLoggedIn: new Date()
        }, function userCreated(err, newUser) {
            if (err) {

                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
                    && err.invalidAttributes.email[0].rule === 'unique') {
                    return res.emailAddressInUse();
                }

                return res.negotiate(err);
            }

            req.session.me = newUser.id;

            return res.json({
                id: newUser.id
            });
        });
    },

    /**
     * Log out of Activity Overlord.
     * (wipes `me` from the sesion)
     */
    logout: function (req, res) {
        // Look up the user record from the database which is
        // referenced by the id in the user session (req.session.me)
        Usuario.findOne({ id: req.session.me.id }, function foundUser(err, user) {
            if (err) return res.negotiate(err);

            // If session refers to a user who no longer exists, still allow logout.
            if (!user) {
                sails.log.verbose('Session refers to a user who no longer exists.');
                //return res.backToHomePage();
                return res.redirect('/#/login');
            }

            // Wipe out the session (log out)
            req.session.destroy(function (err) {
                setTimeout(function () {
                    return res.redirect('/#/login');
                }, 1000);
            });

            // Either send a 200 OK or redirect to the home page

        });
    },

    updateProfile: function (req, res) {

        Usuario.update({
            id: req.param('id')
        }, {
            gravatarURL: req.param('gravatarURL')
        }, function (err, updatedUser) {

            if (err) return res.negotiate(err);

            return res.json(updatedUser);

        });
    },

    changePassword: function (req, res) {

        if (_.isUndefined(req.param('password'))) {
            return res.badRequest('A password is required!');
        }

        if (req.param('password').length < 6) {
            return res.badRequest('Password must be at least 6 characters!');
        }

        Passwords.encryptPassword({
            password: req.param('password'),
        }).exec({
            error: function (err) {
                return res.serverError(err);
            },
            success: function (result) {

                Usuario.update({
                    id: req.param('id')
                }, {
                    encryptedPassword: result
                }).exec(function (err, updatedUser) {
                    if (err) {
                        return res.negotiate(err);
                    }
                    return res.json(updatedUser);
                });
            }
        });
    },

    adminUsers: function (req, res) {

        Usuario.find().exec(function (err, users) {

            if (err) return res.negotiate(err);

            return res.json(users);

        });
    },

    updateAdmin: function (req, res) {

        Usuario.update(req.param('id'), {
            admin: req.param('admin')
        }).exec(function (err, update) {

            if (err) return res.negotiate(err);

            return res.ok();
        });
    },

    updateBanned: function (req, res) {
        Usuario.update(req.param('id'), {
            banned: req.param('banned')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    updateDeleted: function (req, res) {
        Usuario.update(req.param('id'), {
            deleted: req.param('deleted')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    search: function (req, res) {
        var filtro = {};

        for (key in req.allParams()) {
            if (key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        Usuario
        .find(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {

                //for (var i = 0; i < ret.length; i++) {
                //    ret[i].perfil = ret[i].perfil.name;
                //}

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
            if (req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        Usuario.count(filtro)
        .exec(function result(err, ret) {
            if (err) {
                return res.negotiate(err);
            } else {
                res.json(ret);
            }
        });
    }
};
