module.exports = {


    search: function(req, res) {
        var filtro = {};

        for(key in req.allParams()) {
            if(key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if(req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }

        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }


        MedicaoMarcoSuperficialDetalhes.find(filtro)
		.populate('owner')
        .sort('nome asc')
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    }else{
		        res.json(ret); 
		    }
		});
    },

    searchCount: function(req, res) {
        var filtro = {};
		
        for(key in req.allParams()) {
            if(key == 'nome') {
                filtro.nome = { 'contains': req.param('nome') };
                continue;
            }
            if(req.param(key) == undefined) continue;
            filtro[key] = req.param(key);
        }
		
        if (req.session.me.perfil == "Gerente" || req.session.me.perfil == "Operacional") {
            filtro.aterro = req.session.me.aterro.id;
        }


        MedicaoMarcoSuperficialDetalhes.count(filtro)
		.exec(function result(err, ret) {
		    if (err) {
		        return res.negotiate(err);
		    }else{
		        res.json(ret); 
		    }
		});		
    },

	deleteall: function(req, res){
     	var parameters = req.allParams();
     	if (parameters.id == undefined) {
     	    res.status(500);
     	    res.send("Parâmetros insuficientes para concluir a operação.");
     	    return;
     	}

     	MedicaoMarcoSuperficialDetalhes.destroy({
     	    owner: parameters.id
     	}, function result(err, ret) {
     	    if (err) {
     	        return res.negotiate(err);
     	    } else {
     	        res.json('Ok');
     	    }
     	});

	}

	
};