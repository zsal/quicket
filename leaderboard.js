// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".


Players = new Mongo.Collection("players");

var radius = .0007;
var stomps = 20;

var state = "loading"
var situations = ["empty", "loading", "okay"];

if (Meteor.isClient) {

  Session.set('plat', -1);
  Session.set('plng', -1);

  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
  });



  Template.leaderboard.players = function () {
    state = "loading";
    var msglist = Players.find({lat: {$gt: Session.get('plat') - radius, $lt: Session.get('plat') + radius},
     lng: {$gt: Session.get('plng') - radius, $lt: Session.get('plng') + radius} } ,
     {sort: {score: -1, time: -1, name: 1, lat: 1, lng: 1}});

    if(msglist.count()) {
      state = "okay";
      return msglist;
    } else {
      state = "empty";
    }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: -1}});
    },

    'click input.evalit': function() {
      alert("remove score")
    //var players = Players.find({}).fetch();
      Players.update({lat:{$gt: 0}}, {$set: {score: 1}});


    }
    
  });

  Template.player.events({
    'click': function () {
      if(stomps > 0) {
        Session.set("selected_player", this._id);
        Players.update(Session.get("selected_player"), {$inc: {score: -1}});
        stomps--;
        var player = Players.findOne(Session.get("selected_player"));
        if(player.score <= 0) {
          Players.remove(Session.get("selected_player"));
        }
      }
    }
  });

  Template.addPlayer.events = {
    'click input.add': function () {
      // todo - add validation

      if(playerName.value !== "") {
        Players.insert({name: playerName.value, score: 1, time:(new Date).getTime(),
         lat: Session.get('plat') , lng: Session.get('plng') } );

        playerName.value = "";
    }

    },

    'keypress': function (evt, template) {
      if (evt.which === 13 && playerName.value !== "") {
        Players.insert({name: playerName.value, score: 1, time:(new Date).getTime(),
       lat: Session.get('plat') , lng: Session.get('plng') } );
        playerName.value = "";
      }


    }




  };
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["hello world bitch"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], time:(new Date).getTime(), score: Math.floor(Random.fraction()*10)*5, lat: -1, lng: -1});
    }

  });
  /*var decscore = function() {
    var players = Players.find({}).fetch();
    for(x in players) {
      Players.update(x, {$inc: {score: -1}});
      if(x.score <= 0) {
        Players.remove(x);
      }
    }
  }

  var cron = new Meteor.Cron( {
      events:{
        "1 * * * *"  : decscore
      }
    });*/
}
