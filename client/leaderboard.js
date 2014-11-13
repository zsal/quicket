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



Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Session.setDefault('online', -1);
Session.setDefault('plat', -1);
Session.setDefault('plng', -1);


// in meters
Session.setDefault('accuracy', 30);
Session.setDefault('radius', 100);



Session.setDefault('total_quickets', 0);
Session.setDefault("sort", sort['new']);

Tracker.autorun(function () {
  Meteor.subscribe("messages", 
    [Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);
  //console.log(Session.get('radius'));
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

Deps.autorun(function() {
    var v = UserPresences.find({
      'data.location': { 
        $near :[ Session.get("plng"), Session.get("plat") ],
        $maxDistance: Session.get("radius") 
      }
    });
    Session.set("online", v.count());
    //console.log(UserPresences.find().count(), Session.get("online"));
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

// get user location
Meteor.startup(function () {
  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
      Session.set('accuracy', Math.round(position.coords.accuracy));
      //Session.set('radius', Math.max(Math.round(position.coords.accuracy), Session.get('radius') ));
      $("#overlay").delay(1000).fadeOut();
      $("#outer").delay(2000).css('opacity', '1');

      if(start2){
        var x = document.getElementById("errorhandle");
        x.innerHTML = "Found Location!"
        initialize();
        start2--;
      }

      

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

// populate feed
Template.leaderboard.helpers({

  'messages' : function() {
    var msglist; 

    if(Session.get('plat') == -1) {
      return;
    } 
    if(Session.get('sort') == 'me') {
      msglist = MessageDb.find({ $or: [ { author: cookie }, { voters: {$in: [cookie]} } ] });
    } else {
      msglist = MessageDb.find({ 
        location:
         { $near :
            {
              $geometry: { type: "Point",  coordinates: [ Session.get('plng'), Session.get('plat') ] },
              $minDistance: 0,
              $maxDistance: Session.get('radius')
            }
         }
       } , Session.get("sort"));
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

  'msgname' : function(name) {
    var element = name.linkify();
    return new Handlebars.SafeString(element);
  },
  'msgtime' : function(time) {
    var resultstr = " ";

    var diffMs = (new Date() - new Date(time))/1000;
    var diffDays = Math.round(diffMs / 86400); // days
    var diffHrs = Math.round((diffMs % 86400) / 3600); // hours
    var diffMins = Math.round(((diffMs % 86400) % 3600) / 60); // minutes

    if(diffDays) {
        resultstr += diffDays+"d";
    } else if(diffHrs) {
        resultstr += diffHrs+"h";
    } else if(diffMins) {
        resultstr += diffMins+"m";
    } else {
        resultstr += "just now";
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
  'click div #score': function () {
      Session.set("selected_message", this._id);
      Meteor.call("hop", cookie, this._id);
    }
});

Template.addMessage.helpers({

  'imagepreview' : function() {
    return Session.get("photo");
  }
});

// post
Template.addMessage.events = {
  'submit form': function (event, template) {
    var msg = messageText.value;

    if(Session.get("photo")){
      msg += "<br> " + Session.get("photo");
    }

    Meteor.call("post", cookie, msg, Session.get("plng") , Session.get("plat"), function() {
      messageText.value = "";
    });
    Session.set("photo", "");
    event.preventDefault();
    event.stopPropagation();
    return false; 
  },

  'click #photo' : function () {
      var cameraOptions = {
        width: 430,
        height: 350
      };

      MeteorCamera.getPicture(cameraOptions, function (error, data) {
        if(data) {
          Session.set("photo", data);

          /*Meteor.call("post", cookie, data, Session.get("plng") , Session.get("plat"), function() {
            messageText.value = "";
          });*/
        }
      });
  }
};
