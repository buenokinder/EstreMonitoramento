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
