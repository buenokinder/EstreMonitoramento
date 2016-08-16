
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
   	profundidadeMediaCamaraCargaInicial: {
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
    medicoes: {
      collection: 'medicaoPiezometro',
      via: 'owner'
    },    
    owner: {
      model: 'Aterro'
    },
    aterro: {
      model: 'Aterro'
    },
    usuario: {
      model: 'Usuario'
    }
  }
};
/*    prolongamentoCortePiezometro: {
      type: 'string',
      required: true
    },*/
 