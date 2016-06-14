/**
 * Aterro.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    nome: {
      type: 'string',
      required: true
    },
    cidade: {
      type: 'string',
      required: true
    },
    responsavel: {
      type: 'string',
      required: true
    },
    situacao: {
      type: 'string',
      required: false
    },
    observacao: {
      type: 'string',
      required: false
    },
    habilitado: {
      type: 'boolean',
      defaultsTo: true
    }
    
  }
};

