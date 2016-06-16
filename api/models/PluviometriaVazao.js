/**
 * PluviometriaVazao.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
   dataMedicao: {
      type: 'string',
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
