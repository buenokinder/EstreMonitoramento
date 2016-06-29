/**
 * FilesController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	upload: function (req, res) {
    console.log('foi');
    req.file('Mapas').upload({
      dirname: require('path').resolve(sails.config.appPath, '.tmp/public/images')
    },function (err, uploadedFiles) {
      console.log(err);
      if (err) return res.negotiate(err);
        return res.json({
        message: uploadedFiles.length + ' file(s) uploaded successfully!'
  });
});
}
};

