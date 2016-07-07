
module.exports = {

  attributes: {
    nome: {
      type: 'string',
      required: true
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
    dataInstalacao: {
      type: 'datetime',
      required: true
    },
    habilitado: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    }

  }
};

