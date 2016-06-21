/**
 * AterroController
 *
 * @description :: Server-side logic for managing Aterroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	update: function(req, res) {
		var responsavel = req.param('responsavel');		
		var id = req.param('id');
		Aterro.update(id, { responsavel: responsavel.id,nome: req.param('nome'),cidade: req.param('cidade'),endereco: req.param('endereco'),telefone: req.param('telefone')			}, function aterroUpdate(err, newAterro) {
			if (err) {
			  console.log("err: ", err);
			  console.log("err.invalidAttributes: ", err.invalidAttributes);
			  return res.negotiate(err);
			}			

			return res.json({
			  idAterro: newAterro.id,
			  mensagem: "Atualizado com Sucesso!"
			});

		});
  }
}