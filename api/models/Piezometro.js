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
      type: 'datetime',
      required: true
    },
  	usuarioCriador: {
      model: 'Usuario',
      required: true
    },
  	salienciaInicial: {
      type: 'float',
      required: true
    },
  	celulaPiezometrica: {
      type: 'float',
      required: true
    },
   	profundidadeTotalInicial: {
      type: 'float',
      required: true
    },  
   	profundidadeTotalCamaraCarga: {
      type: 'float',
      required: true
    },  
   	prolongamentoCortePiezometro: {
      type: 'float',
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
    }
  }
};