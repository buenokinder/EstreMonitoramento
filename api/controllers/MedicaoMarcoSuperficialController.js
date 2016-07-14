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
          console.log({
                    norte: parameters.norte,
                    este:  parameters.este,
                    cota:  parameters.cota,
                    marcoSuperficial:  marco.id
                });
               MedicaoMarcoSuperficial.create({
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

