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
    norte: {
      type: 'float',
      required: true
    },
    este: {
      type: 'float',
      required: true
    },   
    cota: {
      type: 'float',
      required: true
    }, 
    marcoSuperficial: {
      model: 'marcoSuperficial',
      required: true
    }
  }
};

