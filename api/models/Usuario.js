/**
 * Usuario.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name: {
            type: 'string',
            required: true
        },

        email: {
            type: 'string',
            required: true,
            unique: true
        },
        habilitado: {
            type: 'boolean',
            required: true,
            defaultsTo: false
        },


        encryptedPassword: {
            type: 'string'
           // required: true
        },


        lastLoggedIn: {
            type: 'date',
            required: true,
            defaultsTo: new Date(0)
        },

        perfil: {
            type: 'string',
            enum: ['Administrador', 'Diretor', 'Gerente', 'Operacional']
        },

        aterros: {
            collection: 'Aterro',
            via: 'usuarios'
        }
    },

    beforeCreate: function (value, callback) {
        var Passwords = require('machinepack-passwords');

        Passwords.encryptPassword({
            password: value.password,
            difficulty: 10,
        }).exec({
            error: function (err) {
                callback(err);
                return false;
            },

            success: function (encryptedPassword) {
                require('machinepack-gravatar').getImageUrl({
                    emailAddress: value.email
                }).exec({
                    error: function (err) {
                        callback(err);
                        return false;
                    },
                    success: function (gravatarUrl) {
                        //value = { usuario: value.usuario, name: value.name, email: value.email, perfil: value.perfil, habilitado: value.habilitado, encryptedPassword: encryptedPassword, gravatarUrl: gravatarUrl, lastLoggedIn: value.lastLoggedIn };

                        value.encryptedPassword = encryptedPassword;
                        value.gravatarUrl = gravatarUrl;
                        delete value['password'];
                        delete value['aterro'];
                        delete value['usuario'];

                        callback();
                    }
                });
            }
        });
    }
};

