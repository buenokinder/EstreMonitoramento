/**
 * AlertaController
 *
 * @description :: Server-side logic for managing Saturacao
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    search: function (req, res) {
        var data = [{ id: '30%', name: '30%' }, { id: '50%', name: '50%' }, { id: '70%', name: '70%' }, { id: '90%', name: '90%' }];
  
        return res.json(data);
    },

    searchCount: function (req, res) {
        return 4;
    }

};

