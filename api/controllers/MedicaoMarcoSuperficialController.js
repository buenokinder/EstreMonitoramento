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
        nome: req.param('marco')
    }, function foundUser(err, marco) {
        if (err) {
            return res.negotiate(err);
        }
        if (!marco) {

    nome: {
      type: 'string',
      required: true
    },
    norte: {
      type: 'float',
      required: true
    },
    este: {
      type: 'float',
      required: true
    },
    cota: {
      type: 'float',
      required: true
    },
    dataInstalacao: {
      type: 'date',
      required: true,
      defaultsTo: new Date(0)
    },
    habilitado: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    }

             MarcoSuperficial.create({
              nome: req.param('name'),
              norte: req.param('email'),
              este:  req.param('email'),
              cota:  req.param('email'),
              dataInstalacao: new Date,
              habilitado: true
            }, function userCreated(err, newUser) {
              if (err) {

                console.log("err: ", err);
                console.log("err.invalidAttributes: ", err.invalidAttributes)

            
                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
                  && err.invalidAttributes.email[0].rule === 'unique') {
                  return res.emailAddressInUse();
                }

               
                return res.negotiate(err);
              }

             
              req.session.me = newUser.id;

             
              return res.json({
                id: newUser.id
              });
            });
            return res.notFound('Could not find Finn, sorry.');
        }else{


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

