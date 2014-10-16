// Set up a collection to contain message information. On the server,
// it is backed by a MongoDB collection named "players".

MessageDb = new Mongo.Collection("players");
Website = new Mongo.Collection("website");
var radius = .0007;
var upval_inc = .1;
var newstuffscore = 1;

if (Meteor.isClient) {
  //var sound = new Audio('/chirping.mp3');
  Session.set('plat', -1);
  Session.set('plng', -1);
  Session.set('total_quickets', 0);
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

  Handlebars.registerHelper('session',function(input){
    return Session.get(input);
  });

  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
  });

  Template.leaderboard.messages = function () {
    var msglist = MessageDb.find({lat: {$gt: Session.get('plat') - radius, $lt: Session.get('plat') + radius},
     lng: {$gt: Session.get('plng') - radius, $lt: Session.get('plng') + radius} } ,
     {sort: {score: -1, clicks: -1, time: -1, name: 1, lat: 1, lng: 1}, limit:13});
      
      var msgarr = msglist.fetch();
      newstuffscore = msgarr[Math.floor((msgarr.length - msgarr.length/2))].score;
      Session.set('total_quickets', MessageDb.find({}).count());

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

  Template.leaderboard.events({
    'click input.inc': function () {
      MessageDb.update(Session.get("selected_message"), {$inc: {score: -1}});
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
    'keypress': function (evt, template) {
      if (evt.which === 13 && messageText.value !== "" && Session.get('plat') != -1) {
        MessageDb.insert({name: messageText.value, score: newstuffscore, time:(new Date).getTime(), clicks: 1, voters: [],
       lat: Session.get('plat') , lng: Session.get('plng') } );
        messageText.value = "";
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
      Website.insert({name: 'nextuid', num: 0});
    }
    


  });
  if(Website.find().count() === 2) {
      Website.insert({name: 'nextuid', num: 0});
    }

    MessageDb.update({}, {$set: {clicks:0}})
    MessageDb.update({}, {$set: {voters:[]}})
}
