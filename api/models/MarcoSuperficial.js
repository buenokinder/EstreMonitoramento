
module.exports = {

    attributes: {
        nome: {
            type: 'string',
            required: true,
            unique: true
        },
        norte: {
            type: 'string',
            required: true
        },
        leste: {
            type: 'string',
            required: true
        },
        cota: {
            type: 'string',
            required: true
        },
        dataInstalacao: {
            type: 'date',
            defaultsTo: new Date(0)
        },
        habilitado: {
            type: 'boolean',
            defaultsTo: false
        },
        aterro: {
            model: 'Aterro',
            required: true
        },
        usuario: {
            model: 'Usuario'
        },
        /*medicaoMarcoSuperficialDetalhes: {
          collection: 'medicaoMarcoSuperficialDetalhes',
          via: 'marcoSuperficial'
        },*/
        medicaoMarcoSuperficialDetalhes: {},
        deslocamentos: {}
    }
};
