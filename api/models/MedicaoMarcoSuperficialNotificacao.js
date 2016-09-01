/**
 * MedicaoMarcoSuperficialNotificacao.js
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

        owner: {
            model: 'MedicaoMarcoSuperficial'
        }
    },

    beforeCreate: function (value, callback) {

        MedicaoMarcoSuperficialNotificacao.find({ owner: value.owner }, function (err, notificacao) {
            if (!notificacao || notificacao.length == 0) {
                callback();
            }
        });
    }
};

