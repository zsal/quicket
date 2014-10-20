// Set up a collection to contain message information. On the server,
// it is backed by a MongoDB collection named "players".

MessageDb = new Mongo.Collection("players");
Website = new Mongo.Collection("website");
var upval_inc = .1;
var newstuffscore = 1;
Parse.initialize("s3bB2gf3m7VMdhzWokei3I324u9Qev1unjAB8YXJ", "z9aoFpoCnTnT22Ev8nA0dtGseLDBaBswlfiEj6T3");
 
/*
Able to get within range and chat with the closest person online

Hops add the lat/lng of the hoppers location (bounce idea)

For everything you post or hop you can track where it went and what not (views, hops, etc all on a map ideally)

Two modes: 
| Quickets | Me |

Range bar at top (like Whisper)

Background a lightly faded map?
*/

if (Meteor.isClient) {
  //var sound = new Audio('/chirping.mp3');
  var start = true;
  var newuser = false;
  Session.set('plat', -1);
  Session.set('plng', -1);
  Session.set('accuracy', 30); //in meters
  Session.set('radius', 100);
  Session.set('total_quickets', 0);
  Session.set("sort", "New");
  var cookie = localStorage.getItem('uid');
  if (!cookie) {
    newuser = true;
    cookie = Random.id();
    localStorage.setItem('uid', cookie);
  }

  Handlebars.registerHelper('total_quickets',function(input){
    return Session.get("total_quickets");
  });

  Handlebars.registerHelper('radius', function(input) {
      return (Session.get("radius"));
  });

  Handlebars.registerHelper('session',function(input){
    return Session.get(input);
  });

  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
      Session.set('accuracy', position.coords.accuracy);
      Session.set('radius', Math.max(position.coords.accuracy, Session.get('radius')));
      $("#overlay").delay(1000).fadeOut();
      $("#outer").delay(2000).css('opacity', '1');
  }, function(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0
  });

  Template.leaderboard.messages = function () {
    var msglist; 

    if(Session.get('plat') == -1) {
      return;
    } 

    if(Session.get("sort") == "New") {

    msglist = MessageDb.find({ 
      location:
       { $near :
          {
            $geometry: { type: "Point",  coordinates: [ Session.get('plng'), Session.get('plat') ] },
            $minDistance: 0,
            $maxDistance: Session.get('radius')
          }
       } 
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit:25});

    } else if(Session.get("sort") == "Hot") {

       msglist = MessageDb.find(
        {location:
         { $near :
            {
              $geometry: { type: "Point",  coordinates: [ Session.get('plng'), Session.get('plat') ] },
              $maxDistance: Session.get('radius')
            }
         } 
        },
       {sort: {score: -1, clicks: -1, time: -1, name: 1, location: 1}, limit:25});
    }
      
      var msgarr = msglist.fetch();
      if(msgarr[0]) {
        $("#nothinghere").hide();
        newstuffscore = msgarr[Math.floor((msgarr.length - msgarr.length/2))].score;
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

  Template.leaderboard.events({
    'click input.inc': function () {
      MessageDb.update(Session.get("selected_message"), {$inc: {score: -1}});
    }

  });

  Template.Sorting.events({
    'click #New' : function(e) {
      if(Session.get("sort") == "Hot") {
        Session.set("sort", "New" );
      }
    }, 

    'click #Hot' : function(e) {
      if(Session.get("sort") == "New") {
        Session.set("sort", "Hot" );
      }
    }
  });


  Template.message.events({
    'click div': function () {
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
          voters: [],
          location: { type: "Point", coordinates: [ Session.get("plng") , Session.get("plat") ] } 
        });
        
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

        messageText.value = "";
        
      }

      event.preventDefault();
      event.stopPropagation();
      return false; 
    }
  };
}
