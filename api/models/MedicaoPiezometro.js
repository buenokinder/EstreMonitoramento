/**
 * MedicaoPiezometro.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        dataMedicao: {
            type: 'date',
            required: true,
            defaultsTo: new Date()
        },

        temperatura: {
            type: 'float',
            required: true
        },

        saliencia: {
            type: 'float',
            required: true
        },

        prolongamentoCorte: {
            type: 'float',
            required: true
        },

        medicoesNivelChorumeComPressaoNivelMedido: {
            type: 'float',
            required: true
        },

        medicoesNivelChorumeSemPressaoNivelMedido: {
            type: 'float',
            required: true
        },

        pressaoGasKpa: {
            type: 'float',
            required: true
        },

        pressaoGasMca: {
            type: 'float',
            required: true
        },
        aterro: {
            model: 'Aterro'
        },
        usuario: {
            model: 'Usuario'
        },
        owner: {
            model: 'piezometro'
        }
    }
};