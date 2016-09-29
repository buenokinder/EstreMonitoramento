
module.exports = {

    attributes: {
        nome: {
            type: 'string',
            required: true
           // unique: true
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
            model: 'Aterro'
        },
        usuario: {
            model: 'Usuario'
        },
        //compositePk: {
        //    type: 'string',
        //    unique: true
        //},
        medicaoMarcoSuperficialDetalhes: {},
        deslocamentos: {}
    },

    beforeCreate: function (value, callback) {
        MarcoSuperficial.findOne({ where: { nome: value.nome, aterro: value.aterro } }).exec(function (err, marcoSuperficial) {
            if (marcoSuperficial == undefined) {
                callback();
            }
            else {
                callback("Já existe um marco superficial com o nome e aterro informados.");
            }
        });
    }

    //beforeValidation: function (values, cb) {
    //    if (values.aterro == undefined) {
    //        cb();
    //        return;
    //    }

    //    var aterro = "";
    //    if (typeof values.aterro == "string")
    //        aterro = values.aterro;
    //    else
    //        aterro = values.aterro.id;

    //    values.compositePk = aterro + "|" + values.nome;
    //    cb();
    //}
};
