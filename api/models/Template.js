/**
 * Template.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        dataInicio: {
            type: 'date',
            required: true,
            defaultsTo: new Date(0)
        }, dataFim: {
            type: 'date',
            required: true,
            defaultsTo: new Date(0)
        },
        nome: {
            type: 'string',
            required: true
        },
        corpo: {
            type: 'longtext',
            required: true
        },
        usuario: {
            model: 'Usuario'
        }
    }
};

