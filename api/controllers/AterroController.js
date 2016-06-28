/**
 * AterroController
 *
 * @description :: Server-side logic for managing Aterroes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
// <<<<<<< HEAD

teste: function(req,res)
{

    console.log( "JSON File:" );
    var JsonConvert = require( "./JPN.geo.json" ) ;

    var UtmConverter = require('utm-converter'); // Example using Node.js.
    var converter = new UtmConverter();
    var wgsResult;
    for (var prop in JsonConvert) {
        if (JsonConvert.hasOwnProperty(prop)) {
            console.log(prop);
            switch (prop) {

                case "geometries":
                var geometries = JsonConvert[prop];

                for (var teste in geometries) {



                    for (i = 0; i < geometries[teste].coordinates.length; i++) { 
                        console.log("teste: " +  geometries[teste].coordinates[i][0]);
                        wgsResult = converter.toWgs({"coord":{"x": geometries[teste].coordinates[i][0] ,"y":geometries[teste].coordinates[i][1]},"zone":22,"isSouthern":true});
                        geometries[teste].coordinates[i][0] = wgsResult.coord.longitude;
                        geometries[teste].coordinates[i][1] = wgsResult.coord.latitude;
                    }



                }

                break;
             // obj[prop] has the value
            }
        }
    }
 
    // var wgsCoord = [145.240917, -37.830436];
    
    // var utmResult =[666179.596719106,7161622.580844007,0,-1e+38];//{"coord":{"x":665832.645,"y":7162140.815},"zone":24,"isSouthern":true};
    // // 

    // var wgsResult = converter.toWgs(utmResult);
    require('fs').writeFile(
        './my.json',
        JSON.stringify(JsonConvert),
        function (err) {
            if (err) {
                console.error('Crap happens');
            }
        }
    );
    // console.log(wgsResult);
    // // {"coord":{"longitude":145.24091699999727,"latitude":-37.83043599999867}}
    return res.json(JsonConvert);
},
// =======
update: function(req, res) 
{
    var responsavel = req.param('responsavel');		
    var id = req.param('id');
    Aterro.update(id, { responsavel: responsavel.id,nome: req.param('nome'),cidade: req.param('cidade'),endereco: req.param('endereco'),telefone: req.param('telefone')}, function aterroUpdate(err, newAterro) {
            if (err) {
                console.log("err: ", err);
                console.log("err.invalidAttributes: ", err.invalidAttributes);
                return res.negotiate(err);
            }			
            // >>>>>>> origin/master

            return res.json({
                idAterro: newAterro.id,
                mensagem: "Atualizado com Sucesso!"
            });
        });
    }
}