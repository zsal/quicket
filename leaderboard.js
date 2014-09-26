// Set up a collection to contain message information. On the server,
// it is backed by a MongoDB collection named "players".

MessageDb = new Mongo.Collection("players");
Website = new Mongo.Collection("website");

var radius = .0007;
var upval_inc = .1;
var newstuffscore = 1;

var expression = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;

var urlpattern = new RegExp(expression); // fragment locater


if(!String.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, '<a href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    };
}

if (Meteor.isClient) {
  var sound = new Audio('/chirping.mp3');
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

  Template.leaderboard.messages = function () {
    var msglist = MessageDb.find({lat: {$gt: Session.get('plat') - radius, $lt: Session.get('plat') + radius},
     lng: {$gt: Session.get('plng') - radius, $lt: Session.get('plng') + radius} } ,
     {sort: {score: -1, time: -1, name: 1, lat: 1, lng: 1}, limit:10});
      
      var msgarr = msglist.fetch();
      newstuffscore = msgarr[Math.floor((msgarr.length - msgarr.length/2))].score;
      Session.set('total_quickets', Players.find({}).count());
      //for(x in msgarr) {
        //alert(msgarr[x].name.linkify());
      //}

      sound.play();
      setTimeout(function() {sound.pause();}, 600);

      return msglist;
  };

  Template.leaderboard.selected_name = function () {
    var message = MessageDb.findOne(Session.get("selected_message"));
    return message && message.name;
  };

  Template.message.selected = function () {
    return Session.equals("selected_message", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      MessageDb.update(Session.get("selected_message"), {$inc: {score: -1}});
    }

  });

  Template.message.events({
    'click span.name': function () {
        Session.set("selected_message", this._id);
        var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
        //alert(upval.num);
        MessageDb.update(Session.get("selected_message"), {$inc: {score: upval.num}});
        Website.update(upval._id, {$inc: {num: 1}});

      },

    'click div#boot': function() {
      Session.set("selected_message", this._id);
      var message = MessageDb.findOne(Session.get("selected_message"));
      MessageDb.update(Session.get("selected_message"), {$inc: {score: -1}});
      if(message.score <= 0) {
          MessageDb.remove(Session.get("selected_message"));
        }
    }
  });

  Template.addMessage.events = {
    'click input.add': function () {
      // todo - add validation

      if(messageText.value !== "" && Session.get('plat') != -1) {
        //if(urlpattern.test(messageText.value)) {
         // messageText.value = "<a href="+ messageText.value + ">"+ messageText.value +"</a>";

        //}

        MessageDb.insert({name: messageText.value, score: newstuffscore, time:(new Date).getTime(),
         lat: Session.get('plat') , lng: Session.get('plng') } );

        messageText.value = "";

    }




    },

    'click input.gettotal': function () {
      alert(Session.get('total'));
      
    },

    'keypress': function (evt, template) {
      if (evt.which === 13 && messageText.value !== "" && Session.get('plat') != -1) {
        //if(urlpattern.test(messageText.value)) {
          //messageText.value = "<a href="+ messageText.value + ">"+ messageText.value +"</a>";
        //}
        MessageDb.insert({name: messageText.value, score: newstuffscore, time:(new Date).getTime(),
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
        MessageDb.insert({name: names[i], time:(new Date).getTime(), 
          score: Math.floor(Random.fraction()*10)*5, lat: -1, lng: -1});
    }
    if(Website.find().count() === 0) {
      Website.insert({name: 'total', num: 0});
      Website.insert({name: 'upval', num: 1});

    }

  });
  /*var decscore = function() {
    var messages = MessageDb.find({}).fetch();
    for(x in messages) {
      MessageDb.update(x, {$inc: {score: -1}});
      if(x.score <= 0) {
        MessageDb.remove(x);
      }
    }
  }

  var cron = new Meteor.Cron( {
      events:{
        "1 * * * *"  : decscore
      }
    });*/
}
