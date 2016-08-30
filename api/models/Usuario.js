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
            type: 'string',
            required: true
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
    }
};

