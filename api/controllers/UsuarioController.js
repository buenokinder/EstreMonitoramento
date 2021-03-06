/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */


var Passwords = require('machinepack-passwords');
var Gravatar = require('machinepack-gravatar');

module.exports = {


  login: function (req, res) {
    console.log('veio');

    // Usuario.find().populate('aterro').exec(function(err, users) {
    //     console.log(users);
 
    // })

    Usuario.findOne({
      email: req.param('email')
    }).populate('aterros').exec( function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      require('machinepack-passwords').checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: user.encryptedPassword
      }).exec({

        error: function (err){
          return res.negotiate(err);
        },

        incorrect: function (){
          return res.notFound();
        },

        success: function (){
console.log(user);
  
          req.session.me = user;
          req.session.name = user.name;
          if(user.aterros.length > 0){

req.session.me.aterro = user.aterros[0];

          }
            
          else
            req.session.me.aterro = "";

          return res.ok();
        }
      });
    });

  },


  signup: function(req, res) {

    var Passwords = require('machinepack-passwords');


    Passwords.encryptPassword({
      password: req.param('password'),
      difficulty: 10,
    }).exec({
     
      error: function(err) {
        return res.negotiate(err);
      },

      success: function(encryptedPassword) {
        require('machinepack-gravatar').getImageUrl({
          emailAddress: req.param('email')
        }).exec({
          error: function(err) {
            return res.negotiate(err);
          },
          success: function(gravatarUrl) {
         
            Usuario.create({
              name: req.param('name'),
              email: req.param('email'),
              perfil: req.param('perfil'),
              encryptedPassword: encryptedPassword,
              lastLoggedIn: new Date(),
              gravatarUrl: gravatarUrl
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
          }
        });
      }
    });
  },

  /**
   * Log out of Activity Overlord.
   * (wipes `me` from the sesion)
   */
  logout: function (req, res) {
    console.log(req.session.me);
    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.me)
    Usuario.findOne(req.session.me, function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If session refers to a user who no longer exists, still allow logout.
      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists.');
        return res.backToHomePage();
      }

      // Wipe out the session (log out)
      req.session.me = null;

      // Either send a 200 OK or redirect to the home page
      return res.backToHomePage();

    });
  },
    
      updateProfile: function(req, res) {

    Usuario.update({
      id: req.param('id')
    }, {
      gravatarURL: req.param('gravatarURL') 
    }, function(err, updatedUser) {

      if (err) return res.negotiate(err); 

      return res.json(updatedUser); 

    });
  },

  changePassword: function(req, res) {

    if (_.isUndefined(req.param('password'))) { 
      return res.badRequest('A password is required!');
    }

    if (req.param('password').length < 6) { 
      return res.badRequest('Password must be at least 6 characters!');
    }

    Passwords.encryptPassword({ 
      password: req.param('password'),
    }).exec({
      error: function(err) {
        return res.serverError(err); 
      },
      success: function(result) {

        Usuario.update({ 
          id: req.param('id')
        }, {
          encryptedPassword: result
        }).exec(function(err, updatedUser) {
          if (err) {
            return res.negotiate(err);
          }
          return res.json(updatedUser); 
        });
      }
    });
  },

  adminUsers: function(req, res) {

    Usuario.find().exec(function(err, users){    

      if (err) return res.negotiate(err);   

      return res.json(users);     

    });
  },

  updateAdmin: function(req, res) {

    Usuario.update(req.param('id'), {    
      admin: req.param('admin')   
    }).exec(function(err, update){

     if (err) return res.negotiate(err);  

      return res.ok();       
    });
  },

  updateBanned: function(req, res) {
    Usuario.update(req.param('id'), {
      banned: req.param('banned')
    }).exec(function(err, update){
     if (err) return res.negotiate(err);
      return res.ok();
    });
  },

  updateDeleted: function(req, res) {
    Usuario.update(req.param('id'), {
      deleted: req.param('deleted')
    }).exec(function(err, update){
     if (err) return res.negotiate(err);
      return res.ok();
    });
  }
};
