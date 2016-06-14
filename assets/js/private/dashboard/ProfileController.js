
app.controller('profilePageController', ['$location', '$routeParams', '$scope', '$http', function($location, $routeParams, $scope, $http){


  SCOPE=$scope;

  $scope.me = window.SAILS_LOCALS.me;


  $scope.userProfile = {
    properties: {},
    errorMsg: '',
    saving: false,
    loading: false,
    noProfile: false
  };

  $scope.userProfile.loading = true;


  $scope.removeProfile = function() {

    // console.log('the change userprofile is: ', $scope.userProfile);

    // var theRoute = '/user/removeProfile/' + $scope.userProfile.properties.id;
    var theRoute = '/user/removeProfile/' + $scope.me.id;
    $http.put(theRoute, {
        deleted: true
      })
      .then(function onSuccess(sailsResponse) {


          window.location = '/signup';


        $scope.userProfile.loading = false;
      })
      .catch(function onError(sailsResponse) {

        $scope.userProfile.errorMsg = 'An unexpected error occurred: ' + (sailsResponse.data || sailsResponse.status);

      })
      .finally(function eitherWay() {
        $scope.loading = false;
      });
  };

  $scope.deleteProfile = function() {

    var theRoute = 'user/delete/' + $routeParams.id;

    $http.delete(theRoute)
    .then(function onSuccess(deletedProfile){
      window.location = '#/signup';
    })
    .catch(function onError(err){
      $scope.userProfile.errorMsg = 'An unexpected error occurred: ' + err;
    });
  };

}]);
app.controller('editProfilePageController', ['$location', '$routeParams', '$scope', '$http',  function($location, $routeParams, $scope, $http) {

  // Just a hack so we can type `SCOPE` in the Chrome inspector.
  SCOPE = $scope;

  $scope.me = window.SAILS_LOCALS.me;

  /////////////////////////////////////////////////////////////////////////////////
  // When HTML is rendered... (i.e. when the page loads)
  /////////////////////////////////////////////////////////////////////////////////

  // Set up initial objects
  // (kind of like our schema for the page)
  $scope.editProfile = {
    properties: {},
    errorMsg: '',
    error: false,
    saving: false,
    loading: false,
    changePassword: {}
  };


  $scope.updateProfile = function() {

    var theRoute = 'user/updateProfile/' + $scope.me.id;

    // Submit PUT request to Sails.
    $http.put(theRoute, {
        gravatarURL: $scope.me.gravatarURL
        // gravatarURL: $scope.editProfile.properties.gravatarURL
      })
      .then(function onSuccess(sailsResponse) {

     
        window.location = '#/profile';

        $scope.editProfile.loading = false;
      })
      .catch(function onError(sailsResponse) {
        
        $scope.editProfile.errorMsg = 'An unexpected error occurred: ' + (sailsResponse.data || sailsResponse.status);

      })
      .finally(function eitherWay() {
        $scope.editProfile.loading = false;
      });
  };

  $scope.restore = function() {

   
    $http.put('/user/restoreGravatarURL', {
        email: $scope.me.email
      })
      .then(function onSuccess(sailsResponse) {

        // Restore the current gravatarURL
        $scope.me.gravatarURL = sailsResponse.data;

        $scope.editProfile.loading = false;
      })
      .catch(function onError(sailsResponse) {
        // console.log(sailsResponse);
        // Otherwise, display generic error if the error is unrecognized.
        $scope.editProfile.errorMsg = 'An unexpected error occurred: ' + (sailsResponse.data || sailsResponse.status);

      })
      .finally(function eitherWay() {
        $scope.editProfile.loading = false;
      });
  };

  $scope.changeMyPassword = function() {

    // console.log('the change userprofile is: ', $scope.userProfile);

    $http.put('user/changePassword', {
        id: $scope.me.id,
        password: $scope.editProfile.properties.password
      })
      .then(function onSuccess(sailsResponse) {

        
        window.location='#/profile';
    

        $scope.editProfile.loading = false;
      })
      .catch(function onError(sailsResponse) {
       
        $scope.editProfile.changePassword.errorMsg = 'An unexpected error occurred: ' + (sailsResponse.data || sailsResponse.status);

      })
      .finally(function eitherWay() {
        $scope.editProfile.loading = false;
      });

  };

}]);

