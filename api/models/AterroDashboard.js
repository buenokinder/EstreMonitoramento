
module.exports = {

    attributes: {
        exibirmapahorizontal: {
            type: 'boolean',
            required: true
        },
        exibirmapavertical: {
            type: 'boolean',
            required: true
        },
        exibirlegenda: {
            type: 'boolean',
            required: true
        },
        imagemfatorseguranca: {
            type: 'string'
        },
        fatorseguranca: {
            type: 'float',
            required: true
        },
        exibirfatorseguranca: {
            type: 'boolean',
            required: true
        },
        habilitado: {
            type: 'boolean',
            required: true
        },
        owner: {
            model: 'Aterro'
        }
    }
};