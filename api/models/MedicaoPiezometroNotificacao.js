/**
 * MedicaoPiezometroNotificacao.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        data: {
            type: 'datetime',
            required: true,
            defaultsTo: new Date()
        },

        status: {
            type: 'string',
            required: true,
            enum: ['Pendente', 'Finalizada'],
            defaultsTo: 'Pendente'
        },

        emailgerenteadmin: {
            type: 'boolean',
            defaultsTo: false
        },

        emailgerenteadmindiretor: {
            type: 'boolean',
            defaultsTo: false
        },

        emaildiretor: {
            type: 'boolean',
            defaultsTo: false
        },
        owner: {
            model: 'MedicaoPiezometro'
        }
    },

    beforeCreate: function (value, callback) {

        MedicaoPiezometroNotificacao.find({ owner: value.owner }, function (err, notificacao) {

            if (!notificacao || notificacao.length == 0) {
                callback();
            }
        });
    }
};

