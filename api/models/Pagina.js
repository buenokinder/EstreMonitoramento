/**
 * Pagina.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

 attributes: {
        pagina: {
            type: 'float',
            required: true
        }, conteudo: {
            type: 'longtext'
        },
        nome: {
            type: 'string',
            required: true
        },
        template: {
            model: 'Template'
        },
    }
};


