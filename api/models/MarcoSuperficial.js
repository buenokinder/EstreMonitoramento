
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

    loadDetalhes: function(callback, list, index){
      var _that = this;

      MedicaoMarcoSuperficialDetalhes.find({marcoSuperficial:this.id}).populate("owner").exec(function(err,detalhes){

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

    /*medicoes: function(){
      var medicaoAtual = this;

      var deltaParcialNorte = Math.pow((medicaoAtual.norte - MedicaoAnterior[0].norte), 2);
      var deltaParcialEste = Math.pow((medicaoAtual.leste - MedicaoAnterior[0].leste), 2);
      var deltaTotalNorte = Math.pow((medicaoAtual.norte - MedicaoInicial.norte), 2);
      var deltaTotalEste = Math.pow((medicaoAtual.leste - MedicaoInicial.leste), 2);

      DataAtual = Math.floor(medicaoAtual.data.getTime() / (3600  24  1000));
      DataAnterior = Math.floor(MedicaoAnterior[0].data.getTime() / (3600  24  1000));
      DiferencaDatas = DataAtual - DataAnterior;

      //return Math.abs(MedicaoAtual.data- MedicaoAnterior[0].data);
      retorno.deslocamentoVerticalParcial = (medicaoAtual.cota - MedicaoAnterior[0].cota) * 100;
      retorno.deslocamentoVerticalTotal = (medicaoAtual.cota - MedicaoInicial.cota) * 100;
      retorno.deslocamentoHorizontalParcial = Math.sqrt((deltaParcialNorte + deltaParcialEste) * 100);
      retorno.deslocamentoHorizontalTotal = Math.sqrt((deltaTotalNorte + deltaTotalEste) * 100);
      retorno.velocidadeHorizontal = (retorno.deslocamentoHorizontalParcial / DiferencaDatas);
      retorno.velocidadeVertical = (retorno.deslocamentoVerticalParcial / DiferencaDatas);

      retorno.sentidoDeslocamentoDirerencaNorte = (medicaoAtual.norte - MedicaoInicial.norte) * 100;
      retorno.sentidoDeslocamentoDirerencaEste = (medicaoAtual.este - MedicaoInicial.este) * 100;

      retorno.velocidadeVertical = (retorno.deslocamentoVerticalParcial / DiferencaDatas);

      if (retorno.sentidoDeslocamentoDirerencaNorte > 0)
          retorno.sentidoDeslocamentoNorteSul = "Norte";
      else
          retorno.sentidoDeslocamentoNorteSul = "Sul";

      if (retorno.sentidoDeslocamentoDirerencaNorte > 0)
          retorno.sentidoDeslocamentoNorteSul = "Norte";
      else
          retorno.sentidoDeslocamentoNorteSul = "Sul";


      retorno.criterioAlertaHorizontalMetodologia1 = "Ok"
      for (i = 0; i < alertas.length; i++) {
          if (retorno.velocidadeHorizontal > alertas[i])
              retorno.criterioAlertaHorizontalMetodologia1 = alertas[i].parametro;

          if (retorno.velocidadeHorizontal > alertas[i])
              retorno.criterioAlertaHorizontalVertical1 = alertas[i].parametro;
      }


      this.deslocamentos =  [{p:1, a:2}, {p:2, a:3}];
    }   */ 
  }
};

