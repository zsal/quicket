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
  Session.set('plat', -1);
  Session.set('plng', -1);
  Session.set('radius', .0007);
  Session.set('total_quickets', 0);
  Session.set("sort", "New");
  var cookie = localStorage.getItem('uid');

  if (!cookie) {
    var s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
      function(c) {
        var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16)
      });
    cookie = s;
    localStorage.setItem('uid', s);
  }

  Handlebars.registerHelper('total_quickets',function(input){
    return Session.get("total_quickets");
  });

  Handlebars.registerHelper('radius', function(input) {
      return (Session.get("radius") * 57.8).toFixed(3);
  });

  Handlebars.registerHelper('session',function(input){
    return Session.get(input);
  });

  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
      $("#overlay").delay(1000).fadeOut();
      $("#outer").delay(2000).css('opacity', '1');
  });

  Template.leaderboard.messages = function () {
    var msglist; 
    if(Session.get("sort") == "New") {
    msglist = MessageDb.find({lat: {$gt: Session.get('plat') - Session.get('radius'), $lt: Session.get('plat') + Session.get('radius')},
     lng: {$gt: Session.get('plng') - Session.get('radius'), $lt: Session.get('plng') + Session.get('radius')} } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, lat: 1, lng: 1}, limit:25});
  } else {
     msglist = MessageDb.find({lat: {$gt: Session.get('plat') - Session.get('radius'), $lt: Session.get('plat') + Session.get('radius')},
     lng: {$gt: Session.get('plng') - Session.get('radius'), $lt: Session.get('plng') + Session.get('radius')} } ,
     {sort: {score: -1, clicks: -1, time: -1, name: 1, lat: 1, lng: 1}, limit:25});
  }
      
      var msgarr = msglist.fetch();
      if(msgarr[0]) {
      newstuffscore = msgarr[Math.floor((msgarr.length - msgarr.length/2))].score;
      Session.set('total_quickets', msglist.count());
    }

      //sound.play();
      //setTimeout(function() {sound.pause();}, 600);

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
      if (messageText.value !== "" && Session.get('plat') != -1) {
        MessageDb.insert({name: messageText.value, score: newstuffscore, time:(new Date).getTime(), clicks: 0, voters: [],
       lat: Session.get('plat') , lng: Session.get('plng') } );
        
        var Messages = Parse.Object.extend("Messages");
        var msgs = new Messages();
         
        msgs.set("name", messageText.value);
        msgs.set("score", newstuffscore);
        msgs.set("time", (new Date).getTime());
        msgs.set("coord", new Parse.GeoPoint({latitude: Session.get('plat'), longitude: Session.get('plng')}));

        msgs.save(null, {
          success: function(gameScore) {
            // Execute any logic that should take place after the object is saved.
            //alert('New object created with objectId: ' + gameScore.id);
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            //alert('Failed to create new object, with error code: ' + error.message);
          }
        });


        messageText.value = "";
        event.preventDefault();
        event.stopPropagation();
        return false; 
      }
    }
  };
}

// On server startup, create some messages if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (MessageDb.find().count() === 0) {
      var names = ["hop to the top"];
      for (var i = 0; i < names.length; i++)
        MessageDb.insert({name: names[i], time:(new Date).getTime(), clicks: 1, voters: [],
          score: Math.floor(Random.fraction()*10)*5, lat: -1, lng: -1});
    }
    if(Website.find().count() === 0) {
      Website.insert({name: 'total', num: 0});
      Website.insert({name: 'upval', num: 1});
    }
    


  });

  Meteor.publish("me", function () {
    return MessageDb.find(
      {$or: [{clicks: this.userId}, {author: this.userId}]});
  });

  Meteor.publish("messages", function () {
    return MessageDb.find(
      {$or: [{"public": true}, {invited: this.userId}, {owner: this.userId}]});
  });

}
