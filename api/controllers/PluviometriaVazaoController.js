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
	  		var ret=[];
	  		for(var i=0;i<result.length;i++){
	  			ret.push({id:result[i]});
	  		}

		    res.json(ret);
		  });
		});		
	}
};

