module.exports = {

	deleteall: function(req, res){
     	var parameters = req.allParams();

		MedicaoMarcoSuperficialDetalhes.destroy({
		    marcoSuperficial: parameters.id
		}, function result(err, ret) {
		  if (err) {
		    return res.negotiate(err);
		  }else{
		  	res.json('Ok'); 
		  }
		});
	}

	
};