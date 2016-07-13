/**
 * MedicaoMarcoSuperficialController
 *
 * @description :: Server-side logic for managing medicaomarcosuperficials
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	medicao: function(req, res) 
{
    
    var parameters = req.allParams();
 
    MarcoSuperficial.findOne({
        nome: parameters.nome
    }, function foundUser(err, marco) {
      console.log(marco);
      console.log('indo');
        if (err) {
            return res.negotiate(err);
        }
        if (!marco) {
         
             MarcoSuperficial.create({
              nome: parameters.nome,
              norte: parameters.norte,
              este:  parameters.este,
              cota:  parameters.cota,
              aterro:  parameters.aterro
            }, function userCreated(err, marcoSuperficial) {
               if (err) {
            return res.negotiate(err);
        }
        if (!marcoSuperficial) {
            
        }
             
            });
            return res.notFound('Could not find Finn, sorry.');
        }else{
               MedicaoMarcoSuperficial.create({
                    nome: parameters.nome,
                    norte: parameters.norte,
                    este:  parameters.este,
                    cota:  parameters.cota,
                    aterro:  parameters.aterro
                }, function userCreated(err, marcoSuperficial) {
               if (err) {
            return res.negotiate(err);
        }
        if (!marcoSuperficial) {
        }
             
            });
           

        }

    });
    // var gerente = req.param('gerente');		
    // var id = req.param('id');
    // Aterro.update(id, { gerente: gerente.id,nome: req.param('nome'),cidade: req.param('cidade'),endereco: req.param('endereco'),telefone: req.param('telefone')}, function aterroUpdate(err, newAterro) {
    //         if (err) {
    //             console.log("err: ", err);
    //             console.log("err.invalidAttributes: ", err.invalidAttributes);
    //             return res.negotiate(err);
    //         }			

    //         return res.json({
    //             idAterro: newAterro.id,
    //             mensagem: "Atualizado com Sucesso!"
    //         });
    //     });
    }
};

