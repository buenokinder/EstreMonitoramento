
module.exports = {

  attributes: {
    nome: {
      type: 'string',
      required: true,
       unique: true
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
    /*medicaoMarcoSuperficialDetalhes: {
      collection: 'medicaoMarcoSuperficialDetalhes',
      via: 'marcoSuperficial'
    },*/
    medicaoMarcoSuperficialDetalhes:{},
    deslocamentos:{},
    orderByDate: function (a,b) {
          if (a.data < b.data)
            return -1;
          if (a.data> b.data)
            return 1;
          return 0;
    },

    extractOwners:function(detalhes){
        var owners=[];

        for(var i=0;i<detalhes.length;i++){
          var exists = false;
          
          for(var j=0;j< owners.length;j++){
            if(detalhes[i].owner['id'] == owners[j].id){
              exists = true;
              break;
            }
          }

          if(!exists){
            owners.push(detalhes[i].owner);
          }
        }
        
        
        return owners;
    },

    sortDetalhesByOwnerDate:function(detalhes, owners){
        var ret = [];

        for(var i=0;i< owners.length;i++){
          for(var j=0;j<detalhes.length;j++){
            if(detalhes[j].owner['id'] == owners[i].id){
              ret.push(detalhes[j]);
            }
          }
        }

        return ret;
    },

    loadDetalhes: function(callback, list, index, dataInicial, dataFinal){
      var _that = this;
      var filtro = {};

      if(dataInicial!='' && dataFinal!=''){
        filtro.data = { '>=': dataInicial, '<=': dataFinal };  
      }else{
        if(dataInicial!=''){
          filtro.data = { '>=': dataInicial};  
        }

        if(dataFinal!=''){
          filtro.data = { '<=': dataFinal};  
        }
      }
      
      filtro.marcoSuperficial = this.id;

      MedicaoMarcoSuperficialDetalhes.find(filtro).populate("owner").exec(function(err,detalhes){

        if(null==detalhes || detalhes.length==0){
          callback(list, index, detalhes);
          return;
        }

        var owners =_that.extractOwners(detalhes);
        owners.sort(_that.orderByDate);
        ret =  _that.sortDetalhesByOwnerDate(detalhes, owners);
        callback(list, index, ret);

      });
    }

  }
};
