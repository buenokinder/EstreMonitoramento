/**
 * FatorSeguranca.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    analise: {
      type: 'json',
      required: true
    },
    mes: {
      type: 'json'
    },
    valorRu: {
      type: 'float'
    },
    valorLp: {
      type: 'float'
    },
    secao: {
      model: 'secaoFatorSeguranca',
      required: true
    },
    aterro: {
      model:'Aterro',
      required: true
    }
  }
};

