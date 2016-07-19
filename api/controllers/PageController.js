/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	showHomePage: function (req, res) {

    console.log(req.session.me);
    if (req.session.me) {

      return res.view('dashboard', {
        me:  req.session.me
         
      });

    }


    return res.view('index');
    
  },mapa: function (req, res) {
    return res.view('mapa');
  }, visualizacao: function (req, res) {
    return res.view('visualizacao');
  }

};
