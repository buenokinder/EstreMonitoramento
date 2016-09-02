/**
 * Alerta.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
   nivel: {
      type: 'string',
      required: true
    },
    velocidade: {
      type: 'string',
      required: true
    },
    periodicidade: {
      type: 'string',
      required: true
    },
    criterios: {
      type: 'string',
      required: true
    },
    usuario: {
        model: 'Usuario'
    }
  }
};

