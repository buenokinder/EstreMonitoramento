
/**
 * Piezometro.js
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
  	dataCriacao: {
      type: 'date',
      required: true
    },
  	usuarioCriador: {
      model: 'Usuario',
      required: false
    },
  	salienciaInicial: {
      type: 'string',
      required: true
    },
  	celulaPiezometrica: {
      type: 'string',
      required: true
    },
   	profundidadeTotalInicial: {
      type: 'string',
      required: true
    },  
   	profundidadeTotalCamaraCarga: {
      type: 'string',
      required: true
    },  

    habilitado: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    alertas: {
      collection: 'alertasPiezometro',
      via: 'owner'
    },
    owner: {
      model: 'Aterro'
    },
    aterro: {
      model: 'Aterro',
      required: true
    }
  }
};
/*    prolongamentoCortePiezometro: {
      type: 'string',
      required: true
    },*/
 