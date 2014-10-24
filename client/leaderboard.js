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
var newuser = false;
var ITEMS_INCREMENT = 20;

var sort = {
  "new": {sort: {time: -1, score: -1, clicks: -1}},
  "hot": {sort: {score: -1, clicks: -1, time: -1}}
};


Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Session.setDefault('plat', -1);
Session.setDefault('plng', -1);

// in meters
Session.setDefault('accuracy', 30);
Session.setDefault('radius', 1250);

Session.setDefault('total_quickets', 0);
Session.setDefault("sort", sort['new']);

Tracker.autorun(function () {
  Meteor.subscribe("messages", 
    [Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);
  //console.log(Session.get('radius'));
  Meteor.subscribe("me", cookie);
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
var watchID = navigator.geolocation.watchPosition(function(position) {
    Session.set('plat', position.coords.latitude);
    Session.set('plng', position.coords.longitude);
    Session.set('accuracy', position.coords.accuracy);
    Session.set('radius', Math.max(position.coords.accuracy, Session.get('radius')));
    $("#overlay").delay(1000).fadeOut();
    $("#outer").delay(2000).css('opacity', '1');

    // if ann arbor
    if(position.coords.latitude > 42.24 && position.coords.latitude < 42.33 
      && position.coords.longitude > -83.79 && position.coords.longitude < -83.666) {
      $.each(mich_campus, function(key, val){
        var closest = mich_campus[Session.get("closest")];
        if (closest == null) {
          closest = val;
          Session.set("closest", key);
        }
        var place = Math.abs(val[0] - Session.get("plat")) + Math.abs(val[1] - Session.get("plng"));
        var current = Math.abs(closest[0] - Session.get("plat")) + Math.abs(closest[1] - Session.get("plng"));
        if (place < current) {
          closest = val;
          Session.set("closest", key);
        }
      });
  }
}, function(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
},
{
  enableHighAccuracy: true,
  maximumAge: 0
});

// populate feed
Template.leaderboard.messages = function () {
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
    
    var msgarr = msglist.fetch();
    if(msgarr[0]) {
      $("#nothinghere").hide();
      //newstuffscore = msgarr[Math.floor((msgarr.length - msgarr.length/2))].score;
      Session.set('total_quickets', msglist.count());
    } else {
      $("#nothinghere").show();
    }

    //sound.play();
    //setTimeout(function() {sound.pause();}, 600);

    if(start) {
      if(!newuser) {
        $("#welcoming").alert('close');
      }
      start = false;
    }

    return msglist;
};

Template.leaderboard.selected_name = function () {
  var message = MessageDb.findOne(Session.get("selected_message"));
  return message && message.name;
};

Template.message.selected = function () {
  return Session.equals("selected_message", this._id) ? "selected" : '';
};

Template.message.msgname = function(name) {
  var element = name.linkify();
  return new Handlebars.SafeString(element);
}

Template.message.msgtime = function(time) {
  var resultstr = " ";

  var diffMs = new Date() - new Date(time);
  var diffDays = Math.round(diffMs / 86400000); // days
  var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

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
      if(!this.voters) {
        this.voters = [];
        this.clicks = 0;
      }
      var canvote = this.voters.indexOf(cookie);
      if (canvote === -1){
        var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
        MessageDb.update(this._id, {$inc: {score: upval.num, clicks: 1}});
        MessageDb.update(this._id, {$push: {voters: cookie}});
        Website.update(upval._id, {$inc: {num: 1}});
      }
    }
});

// post
Template.addMessage.events = {
  'submit form': function (event, template) {
    var userspost = messageText.value;

    if (messageText.value !== "" && Session.get('plat') != -1) {
      MessageDb.insert({
        name: messageText.value,
        author: cookie,
        score: newstuffscore,
        time:(new Date).getTime(),
        clicks: 0, 
        voters: [cookie],
        location: { type: "Point", coordinates: [ Session.get("plng") , Session.get("plat") ] } 
      });
      /*
      //Parse Example for future integration
      var Messages = Parse.Object.extend("Messages");
      var msgs = new Messages();
      msgs.set("name", messageText.value);
      msgs.set("score", newstuffscore);
      msgs.set("coord", new Parse.GeoPoint({latitude: Session.get('plat'), longitude: Session.get('plng')}));

      msgs.save(null, {
        success: function(gameScore) {
          //alert('New object created with objectId: ' + gameScore.id);
        },
        error: function(gameScore, error) {
          //alert('Failed to create new object, with error code: ' + error.message);
        }
      });
      */
      messageText.value = "";
      
    }

    event.preventDefault();
    event.stopPropagation();
    return false; 
  }
};
