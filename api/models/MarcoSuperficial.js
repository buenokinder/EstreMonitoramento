
module.exports = {

  attributes: {
    nome: {
      type: 'string',
      required: true
    },
    coordenadasNorte: {
      type: 'float',
      required: true
    },
    coordenadasEste: {
      type: 'float',
      required: true
    },
    coordenadasCota: {
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

