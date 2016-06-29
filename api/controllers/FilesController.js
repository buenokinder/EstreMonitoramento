/**
 * FilesController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	upload: function (req, res) {
    console.log(req.id);

console.log(req.param('myformdata'));
    req.file('Mapas').upload({
      dirname: require('path').resolve(sails.config.appPath, '.tmp/public/images')
    },function (err, uploadedFiles) {
      console.log(uploadedFiles[0].name);
      
      var name = req.param("name");
    var redirectURI = req.param("redirectURI");


    Mapa.create({ dataCriacao : new Date(),
                    usuarioCriador: req.session.me ,
                    mapaFile,
                    aterro: req.id
    }).exec(function(err, client){
      if(err){
        return res.send(500, {error: err.message});
      } else {
        return res.json(client);
      }
    });

      console.log(err);
      if (err) return res.negotiate(err);
        return res.json({
        message: uploadedFiles.length + ' file(s) uploaded successfully!'
  });
});
}
};

