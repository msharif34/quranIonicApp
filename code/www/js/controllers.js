angular.module('quranApp.controllers', ['ionic', 'quranApp.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, User, $http, SERVER, Recommendations, $ionicLoading) {
// helper functions for loading
var ref = new Firebase("https://crackling-torch-7807.firebaseio.com/");
var authData = ref.getAuth();
// if (authData) {
//   console.log("User " + authData.uid + " is logged in with " + authData.provider);
// } else {
//   console.log("User is logged out");
// }
var showLoading = function() {
  $ionicLoading.show({
    template: '<i class="ion-loading-c"></i>',
    noBackdrop: true
  });
}

var hideLoading = function() {
  $ionicLoading.hide();
}

  // set loading to true first time while we retrieve songs from server.
  // showLoading();
// get our first surahs
    Recommendations.init()
    .then(function(){
      var random = Math.round(Math.random() * Recommendations.queue.length - 1);
      $scope.currentQuran = Recommendations.queue[0];
      return Recommendations.playCurrentSurah();
    })
    .then(function(){
          // turn loading off
          hideLoading();
          $scope.currentQuran.loaded = true;
    });

  // fired when we favorite / skip a song.
  $scope.sendFeedback = function (bool) {
    console.log($scope.currentQuran)
    if (bool) User.addQuranToFavorites($scope.currentQuran);
    // set variable for the correct animation sequence
    $scope.currentQuran.rated = bool;
    $scope.currentQuran.hide = true;

    Recommendations.nextQuran();
    $timeout(function() {
    // update current song in scope
    $scope.currentQuran = Recommendations.queue[0];
    $scope.currentQuran.loaded = false;
  }, 250);

    Recommendations.playCurrentSurah().then(function() {
      $scope.currentQuran.loaded = true;
    });
  }
  // $scope.nextQuranImg = function() {
  //   if (Recommendations.queue.length > 1) {
  //     return Recommendations.queue[1].reciter_img_large;
  //   }

  //   return '';
  // }
})

/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User) {
    var ref = new Firebase("https://crackling-torch-7807.firebaseio.com/");
    var authData = ref.getAuth();
    // get the list of our favorites from the user service
    var newRef = new Firebase("https://crackling-torch-7807.firebaseio.com/users/" + authData.password.email.replace(/@.*/, ''));
    // Attach an asynchronous callback to read the data at our favorites reference
    newRef.on("value", function(snapshot) {
      var info = snapshot.val()
      $scope.favorites = info.favorites;
      // console.log('User info'  + JSON.stringify(info.favorites, null, "\t"));
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  // $scope.favorites = User.favorites;
  $scope.removeQuran = function(quran, index) {
    User.removeQuranFromFavorites(quran, index);
  }
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, Recommendations, User) {
  // stop audio when going to favorites page
  $scope.enteringFavorites = function() {
    User.newFavorites = 0;
    Recommendations.haltAudio();
  }

  $scope.leavingFavorites = function() {
    Recommendations.init();
  }

   // expose the number of new favorites to the scope
  $scope.favCount = User.favoriteCount;

})

.controller('SplashCtrl', function($scope, $state, User) {

  // // attempt to signup/login via User.auth
  // $scope.submitForm = function(username, signingUp) {
  //   User.auth(username, signingUp).then(function(data){
  //     // session is now set, so lets redirect to discover page
  //     console.log(data)
  //     $state.go('tab.discover');

  //   }, function(err) {
  //     // error handling here
  //     console.log('Error ------->' + JSON.stringify(err));

  //   });
  // }
  $scope.loginEmail = function(email, password, signingUp){
  var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
 
  ref.authWithPassword({
    email    : $scope.data.email,
    password : $scope.data.password
  }, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
    }
  });
 
};
  $scope.signupEmail = function(email, password, signingUp){ 
   // console.log(email, password, signingUp) 
   // if(signingUp === true){
   //    var ref = new Firebase("https://crackling-torch-7807.firebaseio.com/");
   //  ref.createUser({
   //    email    : email,
   //    password : password
   //  }, function(error, userData) {
   //    if (error) {
   //      console.log("Error creating user:", JSON.stringify(error));
   //      alert('That email is taken, please choose another email.')
   //    } else {
   //      console.log("Successfully created user account with uid:", JSON.stringify(userData.uid));
   //    }
   //  });
   // }else{
   //  var ref = new Firebase("https://crackling-torch-7807.firebaseio.com/");
   //  ref.authWithPassword({
   //    email    : email,
   //    password : password
   //  }, function(error, authData) {
   //    if (error) {
   //      console.log("Login Failed!", JSON.stringify(error));
   //    } else {
   //      console.log("Authenticated successfully with payload:", authData);
   //      $state.go('tab.discover');
   //    }
   //  });
   // }
   User.auth(email, password, signingUp);
   // $state.go('tab.discover');
};

});