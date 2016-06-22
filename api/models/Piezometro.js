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
      required: false
    },
  	dataCriacao: {
      type: 'string',
      required: false
    },
  	usuarioCriador: {
      model: 'Usuario',
      required: false
    },
  	salienciaInicial: {
      type: 'string',
      required: false
    },
  	celulaPiezometrica: {
      type: 'string',
      required: false
    },
   	profundidadeTotalInicial: {
      type: 'string',
      required: false
    },  
   	profundidadeTotalCamaraCarga: {
      type: 'string',
      required: false
    },  
   	prolongamentoCortePiezometro: {
      type: 'string',
      required: false
    },
    habilitado: {
      type: 'boolean',
      required: false,
      defaultsTo: false
    },
    alertas: {
      collection: 'alertasPiezometro',
      via: 'owner'
    }
  }
};