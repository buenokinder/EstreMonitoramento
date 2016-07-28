/**
 * MedicaoMarcoSuperficial.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
     data: {
      type: 'date',
      required: true,
      defaultsTo: new Date(0)
    },
    nomeTopografo: {
      type: 'string',
      required: true
    },
    nomeAuxiliar: {
      type: 'string',
      required: true
    },   
    temperatura: {
      type: 'string',
      required: true
    }, 
    medicaoMarcoSuperficialDetalhes: {
      collection: 'medicaoMarcoSuperficialDetalhes',
      via: 'owner'
    }
  }
};

