/**
 * FatorSeguranca.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    analise: {
      type: 'string',
      required: true
    },
    mes: {
      type: 'string'
    },
    valor: {
      type: 'boolean',
      defaultsTo: false
    },
    secao: {
      model: 'secaoFatorSeguranca',
      required: true
    }
  }
};

