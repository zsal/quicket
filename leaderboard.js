// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");
Website = new Mongo.Collection("website");

var radius = .0007;
var upval_inc = .1;
var newstuffscore = 1;

var expression = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;

var urlpattern = new RegExp(expression); // fragment locater

if (Meteor.isClient) {

  Session.set('plat', -1);
  Session.set('plng', -1);
  Session.set('total_quickets', 0);

  Handlebars.registerHelper('total_quickets',function(input){
    return Session.get("total_quickets");
  });

  var watchID = navigator.geolocation.watchPosition(function(position) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
  });

  Template.leaderboard.players = function () {
    var msglist = Players.find({lat: {$gt: Session.get('plat') - radius, $lt: Session.get('plat') + radius},
     lng: {$gt: Session.get('plng') - radius, $lt: Session.get('plng') + radius} } ,
     {sort: {score: -1, time: -1, name: 1, lat: 1, lng: 1}, limit:10});
      
      var msgarr = msglist.fetch();
      newstuffscore = msgarr[Math.floor((msgarr.length - msgarr.length/2))].score;

      Session.set('total_quickets', Players.find({}).count());

      return msglist;
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
    }

  });

  Template.player.events({
    'click span.name': function () {
        Session.set("selected_player", this._id);
        var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
        //alert(upval.num);
        Players.update(Session.get("selected_player"), {$inc: {score: upval.num}});
        Website.update(upval._id, {$inc: {num: 1}});

      },

    'click div#boot': function() {
      Session.set("selected_player", this._id);
      var player = Players.findOne(Session.get("selected_player"));
      Players.update(Session.get("selected_player"), {$inc: {score: -1}});
      if(player.score <= 0) {
          Players.remove(Session.get("selected_player"));
        }
    }
  });

  Template.addPlayer.events = {
    'click input.add': function () {
      // todo - add validation

      if(playerName.value !== "") {
        //if(urlpattern.test(playerName.value)) {
         // playerName.value = "<a href="+ playerName.value + ">"+ playerName.value +"</a>";

        //}

        Players.insert({name: playerName.value, score: newstuffscore, time:(new Date).getTime(),
         lat: Session.get('plat') , lng: Session.get('plng') } );

        playerName.value = "";

    }




    },

    'click input.gettotal': function () {
      alert(Session.get('total'));
      
    },

    'keypress': function (evt, template) {
      if (evt.which === 13 && playerName.value !== "") {
        //if(urlpattern.test(playerName.value)) {
          //playerName.value = "<a href="+ playerName.value + ">"+ playerName.value +"</a>";
        //}
        Players.insert({name: playerName.value, score: newstuffscore, time:(new Date).getTime(),
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
      var names = ["hop to the top"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], time:(new Date).getTime(), 
          score: Math.floor(Random.fraction()*10)*5, lat: -1, lng: -1});
    }
    if(Website.find().count() === 0) {
      Website.insert({name: 'total', num: 0});
      Website.insert({name: 'upval', num: 1});

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
