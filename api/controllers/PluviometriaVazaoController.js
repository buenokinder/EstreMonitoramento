/**
 * PluviometriaVazaoController
 *
 * @description :: Server-side logic for managing Pluviometriavazaos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	listDistinctAnos: function(req, res){
		PluviometriaVazao.native(function(err,coll){
		  coll.distinct("ano", function(err,result){
		     res.json(result);
		  });
		});		
	}
};

