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
 console.log(parameters);
    MarcoSuperficial.findOne({
        nome: parameters.nome
    }, function foundUser(err, marco) {
        console.log(marco);
        if (err) {
            return res.negotiate(err);
        }
        if (!marco) {
         console.log({
              nome: parameters.nome,
              norte: parameters.norte,
              este:  parameters.este,
              cota:  parameters.cota,
              aterro:  parameters.aterro
            });
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
         
        }else{
          console.log({
                    norte: parameters.norte,
                    este:  parameters.este,
                    cota:  parameters.cota,
                    marcoSuperficial:  marco.id
                });
               MedicaoMarcoSuperficialDetalhes.create({
                    norte: parameters.norte,
                    este:  parameters.este,
                    cota:  parameters.cota,
                    marcoSuperficial:  marco.id
                }, function userCreated(err, medicao) {
               if (err) {
           return res.negotiate(err);
        }
       
             
            });
           

        }

    });
  
     res.json('Ok'); 
    }
};

