/**
 * AlertaController
 *
 * @description :: Server-side logic for managing Alertas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    search: function (req, res) {
        var data = [{id: 'Diretor', name: 'Diretor'},{id: 'Operacional', name: 'Operacional'},{id: 'Administrador', name: 'Administrador'},{id: 'Gerente', name: 'Gerente'}];
  
       // var json = JSON.stringify( data );
        return res.json(data);
    },

    searchCount: function (req, res) {
        return 4;
    }

};

