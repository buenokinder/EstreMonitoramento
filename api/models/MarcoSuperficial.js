
module.exports = {

  attributes: {
    nome: {
      type: 'string',
      required: true
    },
    
    habilitado: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    }

  }
};

