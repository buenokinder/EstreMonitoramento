
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
      type: 'date',
      required: true,
      defaultsTo: new Date(0)
    },
    habilitado: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    }

  }
};

