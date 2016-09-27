/**
 * AlertaController
 *
 * @description :: Server-side logic for managing Alertas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    findAll: function (req, res) {
        var data = [{ index: 1, id: 'Janeiro', name: 'Janeiro' }, { index: 2, id: 'Fevereiro', name: 'Fevereiro' }, { index: 3, id: 'Março', name: 'Março' }, { index: 4, id: 'Abril', name: 'Abril' }, { index: 5, id: 'Maio', name: 'Maio' }, { index: 6, id: 'Junho', name: 'Junho' }, { index: 7, id: 'Julho', name: 'Julho' }, { index: 8, id: 'Agosto', name: 'Agosto' }, { index: 9, id: 'Setembro', name: 'Setembro' }, { index: 10, id: 'Outubro', name: 'Outubro' }, { index: 11, id: 'Novembro', name: 'Novembro' }, { index: 12, id: 'Dezembro', name: 'Dezembro' }];

        res.set('Content-Type', 'application/json; charset=UTF-8');
        return res.json(data);
    },

    search: function (req, res) {
        var data = [{ index: 1, id: 'Janeiro', name: 'Janeiro' }, { index: 2, id: 'Fevereiro', name: 'Fevereiro' }, { index: 3, id: 'Março', name: 'Março' }, { index: 4, id: 'Abril', name: 'Abril' }, { index: 5, id: 'Maio', name: 'Maio' }, { index: 6, id: 'Junho', name: 'Junho' }, { index: 7, id: 'Julho', name: 'Julho' }, { index: 8, id: 'Agosto', name: 'Agosto' }, { index: 9, id: 'Setembro', name: 'Setembro' }, { index: 10, id: 'Outubro', name: 'Outubro' }, { index: 11, id: 'Novembro', name: 'Novembro' }, { index: 12, id: 'Dezembro', name: 'Dezembro' }];
  
        res.set('Content-Type', 'application/json; charset=UTF-8');
        return res.json(data);
    },

    searchCount: function (req, res) {
        return 12;
    }

};

