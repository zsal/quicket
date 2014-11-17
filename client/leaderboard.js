//var sound = new Audio('/chirping.mp3');
var upval_inc = .1;
var newstuffscore = 1;
var start = true;
var start2 = 3;
var newuser = false;
var ITEMS_INCREMENT = 20;


var sort = {
  "new": {sort: {time: -1, score: -1, clicks: -1}},
  "hot": {sort: {score: -1, clicks: -1, time: -1}}
};
var circle;
var map;
var infowindow;
Swiper = new Swipe(['settings', 'leaderboard', 'profilepage']);

Template.main.helpers({
  Swiper: function() {
    return Swiper;
  }
});

  

Template.main.rendered = function() {
Swiper.setPage('leaderboard');
Swiper.moveRight();
Swiper.moveLeft();
  Tracker.autorun(function() {
    if (Swiper.pageIs('leaderboard')) {
      Swiper.leftRight('settings', 'profilepage')
    }

    else if (Swiper.pageIs('settings')) {
      Swiper.leftRight(null, 'leaderboard')
    }
     else if (Swiper.pageIs('profilepage')) {
      Swiper.leftRight('leaderboard', null)
    }
  });
};


Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Session.setDefault('online', -1);
Session.setDefault('plat', -1);
Session.setDefault('plng', -1);
Session.setDefault('my place', "100 meters");
Session.setDefault('campus place', "1000 meters");


// in meters
Session.setDefault('accuracy', 30);
Session.setDefault('radius', 100);



Session.setDefault('total_quickets', 0);
Session.setDefault("sort", sort['new']);
// get user location
Meteor.startup(function () {

  Swiper.setPage('leaderboard');
  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
      Session.set('accuracy', Math.min(Math.round(position.coords.accuracy), 500));

      Session.set('radius', Math.max(Session.get('accuracy'), Session.get('radius') ));
      $("#overlay").delay(1000).fadeOut();
      $("#outer").delay(2000).css('opacity', '1');
      if(start2){
        initialize_map();
        //var x = document.getElementById("errorhandle");
        //x.innerHTML = "Found Location!"
        start2--;
      }
      map.setCenter(new google.maps.LatLng(Session.get("plat"), Session.get("plng")));
      circle.setCenter(new google.maps.LatLng(Session.get("plat"), Session.get("plng")));
  }, function(error) {
    var x = document.getElementById("errorhandle");
    switch(error.code) {
          case error.PERMISSION_DENIED:
              x.innerHTML = "User denied the request for Geolocation."
              break;
          case error.POSITION_UNAVAILABLE:
              x.innerHTML = "Location information is unavailable."
              break;
          case error.TIMEOUT:
              x.innerHTML = "The request to get user location timed out."
              break;
          case error.UNKNOWN_ERROR:
              x.innerHTML = "An unknown error occurred."
              break;
      }
    console.warn('ERROR(' + error.code + '): ' + error.message);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0
  });
});


(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-54737425-1', 'auto');
ga('send', 'pageview');

function upRadius(val) {
    var rad = Math.max(Math.round(Session.get("accuracy")),+val)
    Session.set("radius", rad);
    circle.setRadius(rad);
    map.fitBounds(circle.getBounds());
}

Template.radius.events({
  'click #houserange' : function() {
      var rad = Math.max(Math.round(Session.get("accuracy")),100)
      Session.set("radius", rad);
      circle.setRadius(rad);
      map.fitBounds(circle.getBounds());
  }, 

  'click #campusrange' : function() {
      var rad = Math.max(Math.round(Session.get("accuracy")),1000)
      Session.set("radius", rad);
      circle.setRadius(rad);
      map.fitBounds(circle.getBounds());
  }
});

initialize_map = function() {
    console.log("initializemap", Session.get("plat"), Session.get("plng"));
    var pyrmont = new google.maps.LatLng(Session.get("plat"), Session.get("plng"));
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: pyrmont,
      zoom: 17,
      navigationControl: false,
      mapTypeControl: false,
      scaleControl: false,
      //disableDoubleClickZoom: true,
      streetViewControl: false,
      zoomControl: false
    });

    var request = {
      location: pyrmont,
      radius: 62
    };

    circle = new google.maps.Circle({
      map: map,
      strokeColor: "darkgreen",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "darkgreen",
      fillOpacity: 0.35,
      center: pyrmont,
      radius: Session.get("radius")
    });
    map.fitBounds(circle.getBounds());
    /*
    google.maps.event.addListener(circle, 'click', function() {
      infowindow.setContent("You are here");
      infowindow.open(map, this);
    });*/

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }

  function callback(results, status) {
      console.log(results)
    if (status == google.maps.places.PlacesServiceStatus.OK) {
          //console.log(results[i]);
          Session.set("my place", results[0].name);
          Session.set("campus place", results[0].vicinity);
          //createMarker(results[0]);
    }
  }

  function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }




/*
High level ideas (new -> old):

University of Michigan specific social network (yik yak too general, "near south quad")

when users log in they join chat room of 'closest thing', (north quad, the rock, pierpont, etc)

Able to get within range and chat with the closest person online

Hops add the lat/lng of the hoppers location (bounce idea)

For everything you post or hop you can track where it went and what not (views, hops, etc all on a map ideally)

Two modes: 
| Quickets | Me |

Range bar at top (like Whisper)

Background a lightly faded map?
*/
var lamebackup = "My only aspiration left in college is to find my Umich Crush from last year";
Session.setDefault("closest", null);
var mich_campus = {
  "southquad": [42.273715, -83.742112],
  "westquad": [42.274787, -83.742348],
  "diag": [42.276922, -83.738196],
  "ugli": [42.275596, -83.737177],
  "cclittle": [42.277728, -83.734977],
  "mojo": [42.280030, -83.731405],
  "bursley": [42.293709, -83.720933],
  "pierpont": [42.290943, -83.717607],
  "dude": [42.291134, -83.715708],
  "eecs": [42.292324, -83.714432],
  "cse": [42.292812, -83.716325],
  "giant magnet": [42.289804, -83.714528]
};

Tracker.autorun(function () {
  Meteor.subscribe("messages", 
    [Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);
  //console.log(Session.get('radius'));
  Meteor.subscribe("housemessages", 
    [Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);
  
  Meteor.subscribe("me", cookie);
  Meteor.subscribe("yaks",
     [Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);
  Meteor.subscribe('userPresence');
});

UserPresence.data = function() {
  return {
    location: [ Session.get("plng") , Session.get("plat") ] 
  };
}

Tracker.autorun(function() {
    var v = UserPresences.find({
      'data.location': { 
        $near :[ Session.get("plng"), Session.get("plat") ],
        $maxDistance: Session.get("radius") / 6371
      }
    });
    Session.set("online", v.count());
    //console.log(UserPresences.find().count(), Session.get("online"));
});

Tracker.autorun(function() {
  if(map && Session.get('plat') !=-1) {
    initialize_map();
    var loc = new google.maps.LatLng(Session.get('plat'), Session.get('plng'))
    map.panTo(loc);
    circle.setCenter(loc);
  }
});

Meteor.subscribe("website");

// identify user
var cookie = localStorage.getItem('uid');
if (!cookie) {
  newuser = true;
  cookie = Random.id();
  localStorage.setItem('uid', cookie);
}

Handlebars.registerHelper('session',function(input){
  return Session.get(input);
});



// populate feed
Template.leaderboard.helpers({

  'messages' : function() {
    var msglist; 

    var query = {};

    if(Session.get('plat') == -1) {
      return;
    } 
    if(Session.get('sort') == 'me') {
      msglist = MessageDb.find({ $or: [ { author: cookie }, { voters: {$in: [cookie]} } ] }, {sort:{time:-1}});
    } else {
      var mindist = 0;
      if(Session.get('radius') > 100) {
        mindist = 100;
        query.house = {$gt: 100};
      }
      query = { 
        location:
         { $near :
            {
              $geometry: { type: "Point",  coordinates: [ Session.get('plng'), Session.get('plat') ] },
              $minDistance: mindist,
              $maxDistance: Session.get('radius')
            }
         }
       };

      msglist = MessageDb.find(query, Session.get("sort"));
    }
      
      Session.set('total_quickets', msglist.count());

      //sound.play();
      //setTimeout(function() {sound.pause();}, 600);

      if(start) {
        if(!newuser) {
          $("#welcoming").alert('close');
        } 
        start = false;
      }

      return msglist;
  },

  'selected_name' : function () {
    var message = MessageDb.findOne(Session.get("selected_message"));
    return message && message.name;
  },

  'profilemode' : function () {
    return Session.get("sort") == "me";
  }

});

Template.message.helpers({
  'selected' : function () {
    return Session.equals("selected_message", this._id) ? "selected" : '';
  },
  'ismedia' : function() {
    return this.media;
  },
  'msgname' : function(name) {
    var element = name.linkify();
    return new Handlebars.SafeString(element);
  },
  'msgtime' : function(time) {
    var resultstr = " ";
    var dt = new Date(time);

    var diffMs = (new Date() - dt)/1000;
    var diffDays = Math.round(diffMs / 86400); // days
    if(diffDays) {
        if(diffDays < 10)
          resultstr += diffDays+"d";
        else
          resultstr += dt.toISOString().slice(0, 10);
    } else {
      var diffHrs = Math.round((diffMs) / 3600); // hours
      if(diffHrs) {
        resultstr += diffHrs+"h";
      } else {
        var diffMins = Math.round(diffMs / 60); // minutes
        if(diffMins) {
            resultstr += diffMins+"m";
        } else {
            resultstr += "just now";
        }
      }
    }

    return new Handlebars.SafeString(resultstr);
  }

});
/*
Template.message.rendered = function() {
    this.$(".message").hide()
    setTimeout(function() {

      this.$(".message").fadeIn({queue: false, duration: 300});;
      this.$(".message").animate({top: "0px"}, 200);
    }, 0);
}
*/

Template.Sorting.events({
  'click #New' : function(e) {
      Session.set("sort", sort['new'] );
  }, 

  'click #Hot' : function(e) {
      Session.set("sort", sort['hot'] );
  },

  'click #Me' : function(e) {
      Session.set("sort", "me" );
  }
});


// hop (upvote)
Template.message.events({
  'click div #upvote': function () {
      Session.set("selected_message", this._id);
      Meteor.call("hop", cookie, this._id, 1);
    },
  'click div #downvote': function () {
      Session.set("selected_message", this._id);
      Meteor.call("hop", cookie, this._id, -1);
    },
  'touchstart #mediacontent' : function(e) {
    if(this.media) {
      $(e.currentTarget).css({
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: $(window).width(),
            height: $(window).height(), 
            'margin': 0,
            'border-radius': 0,
            'border': '1px solid black',
            'background-color': 'black',
            'background-size': 'contain',
            'z-index': 10000
        });
    }
  },

  'touchend #mediacontent' : function(e) {
    if(this.media) {
      $(e.currentTarget).css({
            position: 'relative',
            'width': '3.6em',
            'height': '3.8em',
            border:'.1em solid #d1d1d1',
            'margin-bottom': '1em',
            'margin-top': '1em',
            'border-radius': '3em',
            'background-color': 'white',
            'background-size': 'cover',
            'z-index': 1
        });
    }
  }

  
});

Template.addMessage.helpers({

  'ismediapreview' : function() {
    return Session.get("media");
  }
});

// post
Template.addMessage.events = {
  'submit form': function (event, template) {
    var msg = messageText.value;
    var privacy = false;

    if(Session.get("sort") == 'me') {
      privacy = true;
    }

    Meteor.call("post",
      cookie, msg, Session.get("media"), Session.get("plng") , Session.get("plat"), Session.get("radius"), privacy,
      function() {
        messageText.value = "";
        Session.set("media", "");
      }
    );
    event.preventDefault();
    event.stopPropagation();
    return false; 
  },
  'click #addlink' : function () {
    var msg = messageText.value;
    var linkprev = msg.imageify();
    if(linkprev) {
      Session.set('media', linkprev);
    }
  },

  'click #addphoto' : function () {
      var cameraOptions = {
        width: 600,
        height: 800
      };

      MeteorCamera.getPicture(cameraOptions, function (error, data) {
        if(data) {
          Session.set("media", data);
          /*Meteor.call("post", cookie, data, Session.get("plng") , Session.get("plat"), function() {
            messageText.value = "";
          });*/
        }
      });
  }
};
