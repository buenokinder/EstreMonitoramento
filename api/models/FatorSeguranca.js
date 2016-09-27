
/**
 * FatorSeguranca.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        saturacao: {
            type: 'json',
            required: true
        },
        mes: {
            type: 'string',
            enum: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        },
        mesSearch: {
            type: 'integer'
        },
        ano: {
            type: 'integer'
        },
        valorRu: {
            type: 'float'
        },
        valorLp: {
            type: 'float'
        },
        secao: {
            model: 'secaoFatorSeguranca'
        },
        aterro: {
            model: 'Aterro',
            required: true
        },
        usuario: {
            model: 'Usuario'
        }
    }
};

