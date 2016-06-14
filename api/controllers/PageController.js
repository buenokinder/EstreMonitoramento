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
        me: {
          id: req.session.me,
          name: req.session.name
        
        }
      });

    }


    return res.view('index');
    
  },

};
