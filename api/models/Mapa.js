
module.exports = {

    attributes: {

        dataCriacao: {
            type: 'date',
            required: false,
            defaultsTo: new Date()
        },
        usuarioCriador: {
            model: 'Usuario',
            required: false
        },
        mapaFile: {
            type: 'string',
            required: false
        },
        aterro: {
            model: 'Aterro'
        }
    }
};

