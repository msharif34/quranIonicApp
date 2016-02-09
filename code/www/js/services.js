angular.module('quranApp.services', [])

.factory('User', function($http, SERVER, $state) {
  var ref = new Firebase("https://crackling-torch-7807.firebaseio.com/");
  var authData = ref.getAuth();
  // var currentUser = authData.password.email.replace(/@.*/, '');
  var usersRef = ref.child("users");
  var favoritesRef = ref.child("favorites");
  var testFavorites;
  var newRef = new Firebase("https://crackling-torch-7807.firebaseio.com/users/" + authData.password.email.replace(/@.*/, ''));
  // Attach an asynchronous callback to read the data at our posts reference
  // newRef.on("value", function(snapshot) {
  //   var test = snapshot.val()
  //   testFavorites = test.favorites
  //   console.log('User info'  + JSON.stringify(testFavorites, null, "\t"));
  // }, function (errorObject) {
  //   console.log("The read failed: " + errorObject.code);
  // });
  var o = {
    email: authData.password.email,
    favorites: [],
    newFavorites: 0
  }

// attempt login or signup
  o.auth = function(email, password, signingUp) {
    var authRoute;

  if(signingUp === true){
    usersRef.child(authData.password.email.replace(/@.*/, '')).set({
      email: authData.password.email
    });
    ref.createUser({
      email    : email,
      password : password
    }, function(error, userData) {
      if (error) {
        console.log("Error creating user:", JSON.stringify(error));
        alert('That email is taken, please choose another email.')
      } else {
        console.log("Successfully created user account with uid:", JSON.stringify(userData.uid));
      }
    });
   }else{
    console.log(JSON.stringify(ref.authData, null, "\t"))
    ref.authWithPassword({
      email: email,
      password : password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", JSON.stringify(error));
      } else {
        console.log("Authenticated successfully with payload:", authData);
        // console.log("User " + authData.uid + " is logged in with " + authData.provider);
        $state.go('tab.discover');
      }
    });   
   }

  }

	o.addQuranToFavorites = function(quran) {
	    // make sure there's a song to add
	    if (!quran) return false;
      usersRef.child(currentUser).child('favorites').push(quran)
      // var postsRef = favoritesRef.push(quran);
	    // add to favorites array
	    o.favorites.unshift(quran);

	    o.newFavorites++;
	  }

	  o.removeQuranFromFavorites = function(quran, index) {
	    // make sure there's a song to add
	    if (!quran) return false;
      var list = [];
      newRef.on('value', function(snap){
        var info = snap.val(); 
        var list = Object.keys(info.favorites).map(function(k){
          return list[k]
        });
      });
        // list.splice(index, 1);
        // newRef.set(list)
       
      console.log(JSON.stringify(list, null, "\t"))
	    // add to favorites array
	    o.favorites.splice(index, 1);
  	}

	  o.favoriteCount = function() {
	    return o.newFavorites;
	  }

  return o;
})

.factory('Recommendations', function($http, SERVER, $q) {
	var media;
  var o = {
    queue: []
  };

 o.getNextQuran = function() {
	    return  $http.get('http://localhost:3000/quran').then(function(resp) {
	    // console.log('Success', JSON.stringify(resp.data.length));
	    o.queue = o.queue.concat(resp.data);
	  }, function(err) {
	    console.error('ERR', JSON.stringify(err));
	    // err.status will contain the status code
	  })
  }

   o.nextQuran = function() {
    // pop the index 0 off
    o.queue.shift();

 // end the surah
    o.haltAudio();
    // low on the queue? lets fill it up
    if (o.queue.length <= 3) {
      o.getNextQuran();
    }

  }
  o.playCurrentSurah = function() {
    var defer = $q.defer();

    // play the current song's preview
    media = new Audio(o.queue[0].audio);

    // when song loaded, resolve the promise to let controller know.
    media.addEventListener("loadeddata", function() {
      defer.resolve();
    });

    media.play();

    return defer.promise;
  }

  // used when switching to favorites tab
  o.haltAudio = function() {
    if (media) media.pause();
  }

  o.init = function() {
    if (o.queue.length === 0) {
      // if there's nothing in the queue, fill it.
      // this also means that this is the first call of init.
      return o.getNextQuran();

    } else {
      // otherwise, play the current song
      return o.playCurrentSurah();
    }
  }

  return o;
})