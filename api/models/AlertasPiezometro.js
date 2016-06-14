/**
 * AlertasPiezometro.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    mensagem: {
      type: 'string',
      required: true
    },
    medida: {
      type: 'float',
      required: true
    },
     owner: {
      model: 'Piezometro'
    }
  }
};

