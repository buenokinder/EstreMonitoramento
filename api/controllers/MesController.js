/**
 * AlertaController
 *
 * @description :: Server-side logic for managing Alertas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    findAll: function (req, res) {
        var data = [{ id: 'Janeiro', name: 'Janeiro' }, { id: 'Fevereiro', name: 'Fevereiro' }, { id: 'Março', name: 'Março' }, { id: 'Abril', name: 'Abril' }, { id: 'Maio', name: 'Maio' }, { id: 'Junho', name: 'Junho' }, { id: 'Julho', name: 'Julho' }, { id: 'Agosto', name: 'Agosto' }, { id: 'Setembro', name: 'Setembro' }, { id: 'Outubro', name: 'Outubro' }, { id: 'Novembro', name: 'Novembro' }, { id: 'Dezembro', name: 'Dezembro' }];

        res.set('Content-Type', 'application/json; charset=UTF-8');
        return res.json(data);
    },

    search: function (req, res) {
        var data = [{ id: 'Janeiro', name: 'Janeiro' }, { id: 'Fevereiro', name: 'Fevereiro' }, { id: 'Março', name: 'Março' }, { id: 'Abril', name: 'Abril' }, { id: 'Maio', name: 'Maio' }, { id: 'Junho', name: 'Junho' }, { id: 'Julho', name: 'Julho' }, { id: 'Agosto', name: 'Agosto' }, { id: 'Setembro', name: 'Setembro' }, { id: 'Outubro', name: 'Outubro' }, { id: 'Novembro', name: 'Novembro' }, { id: 'Dezembro', name: 'Dezembro' }];
  
        res.set('Content-Type', 'application/json; charset=UTF-8');
        return res.json(data);
    },

    searchCount: function (req, res) {
        return 12;
    }

};

