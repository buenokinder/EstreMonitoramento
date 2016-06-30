/**
 * FilesController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	upload: function (req, res) {
  
    req.file('Mapas').upload({
      dirname: require('path').resolve(sails.config.appPath, '.tmp/public/images')
    },function (err, uploadedFiles) {
   
    var filename = uploadedFiles[0].fd.replace('/Users/carlosbueno/Documents/Git/EstreMonitoramento/.tmp/public/images/','');
console.log(filename);


    Mapa.create({ dataCriacao : new Date(),
                    usuarioCriador: req.session.me ,
                    mapaFile: filename,
                    aterro: req.id
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

