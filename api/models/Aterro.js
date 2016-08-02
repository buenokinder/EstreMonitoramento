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
    usuarios: {
      collection: 'Usuario',
      via: 'aterros'
    },
    observacao: {
      type: 'string',
      required: false
    },
    situacao: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    alertas: {
      collection: 'Piezometro',
      via: 'owner'
    }
    
  }
};

