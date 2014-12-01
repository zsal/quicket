ITEMS_INCREMENT = 10;

var start = true;
var newuser = false;
var previoustotal = 0;
//var sound = new Audio('/chirping.mp3');

Session.setDefault('newlimit', ITEMS_INCREMENT);
Session.setDefault('hotlimit', ITEMS_INCREMENT);
Session.setDefault('total_quickets', 0);

Tracker.autorun(function () {
  //Meteor.subscribe("localmessages",[Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('locallimit')]);
  if(Session.get('plat') && Session.get('plng')){
    Meteor.subscribe("newmessages",[Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('newlimit')]);
    Meteor.subscribe("hotmessages",[Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('hotlimit')]);
    Meteor.subscribe('userPresence');
  }
  
  //console.log(Session.get('radius'));
  //Meteor.subscribe("me", cookie);
  //Meteor.subscribe("yaks",[Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);
});

Meteor.subscribe("website");

// identify user
cookie = localStorage.getItem('uid');
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
      /*if(Session.get('radius') > 100) {
        mindist = 100;
        query.house = {$gt: 100};
      }*/
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

      msglist = MessageDb.find(query, sort[Session.get("sort")]);
    }
        //Session.set('total_quickets', msglist.count());
        console.log("times",  msglist.count());

    /*
      if(numberofentries > Session.get('total_quickets')){
        $("#showMoreResults").show();
        Session.set('total_quickets', numberofentries);
      } else{
        $("#showMoreResults").hide();
      }
*/
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

  'thereismore' : function () {
    return previoustotal != Session.get("total_quickets");
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

// hop (upvote)
Template.leaderboard.events({
  'click div #upvote': function () {
      Session.set("selected_message", this._id);
      Meteor.call("hop", cookie, this._id, 1);
    },
  'click div #showMoreResults' :function() {
      Session.set(sort[Session.get("sort")]+"limit", Session.get(sort[Session.get("sort")]+"limit") + ITEMS_INCREMENT);
  },
  'click div #downvote': function () {
      Session.set("selected_message", this._id);
      Meteor.call("hop", cookie, this._id, -1);
    },
  'touchstart #mediacontent, mousedown #mediacontent' : function(e) {
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
      $(e.currentTarget.parentNode.children[2]).css({
        display:'none'
      });
      $(e.currentTarget.parentNode.children[1]).css({
          position: 'fixed',
          color: 'white',
            'padding-left': '0em',
            width: '100%',
            opacity: .7,
            'font-size': '1.5em',
            'text-align': 'center',
            'background-color': 'black',
            'z-index': 10001
      });
    }
  },

  'touchend #mediacontent, mouseup #mediacontent' : function(e) {
    if(this.media) {
      $(e.currentTarget).css({
            position: 'relative',
            'width': '3.6em',
            'height': '3.8em',
            border:'.1em solid #d1d1d1',
            'margin-left': '.3em',
            'border-radius': '3em',
            'background-color': 'white',
            'background-size': 'cover',
            'z-index': 1
        });

      $(e.currentTarget.parentNode.children[1]).css({
          position: 'initial',
          color: 'black',
          'text-align': 'initial',
            bottom: '10%',
            width: '70%',
            'padding-left': '1em',
            opacity: 1,
            'font-size': '.94em',
            'background-color': 'initial',
            'z-index': 1
      });
      $(e.currentTarget.parentNode.children[2]).css({
        display:'block'
      });
    }
  }

  
});