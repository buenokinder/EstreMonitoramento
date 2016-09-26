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

    _findOrCreateAlerta: function (alerta, callback) {
        var _that = this;

        Alerta.findOne({
            nivel: alerta.nivel
        }).exec(function (err, alertaRet) {

            if (err) {
                callback(err);
            }
            else {
                if (!alertaRet) {
                    
                    Alerta.create(alerta).exec(function (err, alertas) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(err, alertas);
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
                "Aceitável": { nivel: "Aceitável", criterios: "Estável", velocidade: "0.25", periodicidade: "Semanal", next:"Regular" },
                "Regular": { nivel: "Regular", criterios: "Estável", velocidade: "1", periodicidade: "Semanal", next: "Atenção" },
                "Atenção": { nivel: "Atenção", criterios: "Verificação \"in situ\" de eventuais problemas", velocidade: "4", periodicidade: "2 dias", next: "Intervenção" },
                "Intervenção": { nivel: "Intervenção", criterios: "Paralisação imediata das operações no aterro e intervençães localizadas", velocidade: "14", periodicidade: "Diária", next: "Paralisação" },
                "Paralisação": { nivel: "Paralisação", criterios: "Definição de estado de alerta, paralisação imediata das operaçães, acionamento da Defesa Civil para as providências cabíveis", velocidade: "100000000.01", periodicidade: "Diária", next: null }
            };

            var config = function (nivel){
                var callback = function (err, sucess) {
                    if (err) {
                        return res.negotiate(err);
                    }
                    if (niveis[nivel].next == null) {
                        return resolve("Alertas Criados");
                    }
                    config(niveis[nivel].next);
                };

                var alerta = {
                    nivel: niveis[nivel].nivel,
                    criterios: niveis[nivel].criterios,
                    velocidade: niveis[nivel].velocidade,
                    periodicidade: niveis[nivel].periodicidade
                }

                _that._findOrCreateAlerta(alerta, callback);
            };

            config("Aceitável");
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

    logout: function (req, res) {
        if (undefined == req.session || undefined == req.session.me) {
            return res.redirect('/#/login');
        }

        Usuario.findOne({ id: req.session.me.id }, function foundUser(err, user) {
            if (err) {
                return res.negotiate(err);
            }

            if (!user) {
                return res.redirect('/#/login');
            }

            req.session.destroy(function (err) {
             
                setTimeout(function () {
                    
                    //sails.sockets.emit({}, 'logout', { });

                    //if (req.isSocket) {//Não envia a mensagem para a aba que solicitou o logout.
                    //    sails.sockets.broadcast('message', 'logout', { message: 'Sessão finalizada.' }, req);
                    //}
                    //sails.sockets.broadcast('message', 'logout', { message: 'Sessão finalizada.' }, req);
                    //sails.sockets.broadcast('artsAndEntertainment', { greeting: 'Sessão finalizada' });
                    return res.redirect('/#/login');
                }, 1000);
            });
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

    update: function (req, res) {

        if (_.isUndefined(req.param('password'))) {
            return res.badRequest('Senha não informada!');
        }

        Passwords.encryptPassword({
            password: req.param('password'),
            difficulty: 10
        }).exec({
            error: function (err) {
                return res.serverError(err);
            },
            success: function (encryptedPassword) {

                Usuario.update({
                    id: req.param('id')
                }, {
                    encryptedPassword: encryptedPassword,
                    email: req.param('email'),
                    habilitado: req.param('habilitado'),
                    perfil: req.param('perfil')
                }).exec(function (err, updatedUser) {
                    if (err) {
                        return res.negotiate(err);
                    }
                    return res.json(updatedUser);
                });
            }
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
