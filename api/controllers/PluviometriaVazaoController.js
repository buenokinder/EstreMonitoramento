/**
 * PluviometriaVazaoController
 *
 * @description :: Server-side logic for managing Pluviometriavazaos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	search: function(req, res){
	    var filtro = {};
		
		for(key in req.allParams()) {
			if(req.param(key)==undefined)continue;

			filtro[key] = req.param(key);
		}

		if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
		    filtro.aterro = req.session.me.aterro.id;
		}

		var sort = { ano:  'ASC', mes: 'ASC', dia:'ASC' };

	    PluviometriaVazao.find({ where: filtro, sort: sort })
		.populate('usuario')
		.populate('aterro')
		.exec(function(err, ret){
			if(err){
				return res.negotiate(err);
			}else{
				res.json(ret);	
			}
		});
	},

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

