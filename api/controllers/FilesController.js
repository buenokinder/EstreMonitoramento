/**
 * FilesController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	upload: function (req, res) {
    var parameters = req.allParams();
   console.log(sails.config.appPath);
    req.file('Mapas').upload({
      dirname: require('path').resolve(sails.config.appPath, 'assets/images')
    },function (err, uploadedFiles) {
   

    //var filename = uploadedFiles[0].fd.replace("/var/estre/EstreMonitoramento/assets/images/","");
   var filename = uploadedFiles[0].fd.replace("/Users/carlosbueno/Documents/Git/EstreMonitoramento/assets/images/","");





    Mapa.create({ dataCriacao : new Date(),
                    usuarioCriador: req.session.me ,
                    mapaFile: filename,
                    aterro: parameters.id
    }).exec(function(err, client){
      if(err){
        console.log('erro');
      } else {
        console.log('foi');
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

