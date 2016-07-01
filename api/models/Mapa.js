
module.exports = {

  attributes: {
  
  	dataCriacao: {
      type: 'string',
      required: false
    },
  	usuarioCriador: {
      model: 'Usuario',
      required: false
    }, 
   	mapaFile: {
      type: 'string',
      required: false
    },
    aterro: {
      model: 'Aterro'
    }
  }
};