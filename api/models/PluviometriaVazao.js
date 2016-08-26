/**
 * PluviometriaVazao.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        data: {
            type: 'string',
            required: true,
            unique: true
        },
        dataInserted: {
            type: 'date',
            required: true,
            defaultsTo: new Date(0)

        },
        dia: {
            type: 'integer',
            required: true
        },
        mes: {
            type: 'integer',
            required: true
        },
        ano: {
            type: 'integer',
            required: true
        },
        pluviometria: {
            type: 'float',
            required: true
        },
        vazao: {
            type: 'float',
            required: true
        },
        aterro: {
            model: 'Aterro'
        },
        usuario: {
            model: 'Usuario'
        }
    }
};
