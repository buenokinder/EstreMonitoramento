/**
 * FilesController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	uploadAvatar: function (req, res) {

  req.file('avatar').upload({
    maxBytes: 20000000,
    dirname: require('path').resolve(sails.config.appPath, 'assets/mapas')
  },function (err, uploadedFiles) {
  if (err) return res.negotiate(err);

  return res.json({
    message: uploadedFiles.length + ' file(s) uploaded successfully!'
  });
});
}
};

