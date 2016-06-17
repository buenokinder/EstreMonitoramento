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
    endereco: {
      type: 'string',
      required: true
    },
    telefone: {
      type: 'string',
      required: true
    },    
    responsavel: {
      model: 'Usuario',
      required: true
    },
    observacao: {
      type: 'string',
      required: false
    },
    situacao: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    }
    
  }
};

