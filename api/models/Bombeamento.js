
module.exports = {

  attributes: {
    data: {
      type: 'date',
      required: true
    },
  	bomba: {
      type: 'string',
      required: true
    },
    numeros: {
      type: 'float',
      required: true
    },
    ciclos: {
      type: 'float',
      required: true
    }
    ,
    litros: {
      type: 'float',
      required: true
    },    
    aterro: {
      model: 'Aterro',
      required: true
    }
  }
};