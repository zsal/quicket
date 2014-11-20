//var sound = new Audio('/chirping.mp3');
var upval_inc = .1;
var newstuffscore = 1;
var start = true;
var start2 = 2;
var newuser = false;
var ITEMS_INCREMENT = 10;



var sort = {
  "new": {sort: {time: -1, score: -1, clicks: -1}},
  "hot": {sort: {score: -1, clicks: -1, time: -1}}
};
var circle;
var map;
var infowindow;

Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Session.setDefault('online', 1);
Session.setDefault('plat', -1);
Session.setDefault('plng', -1);
Session.setDefault('my place', "Welcome to Quicket!");
Session.setDefault('campus place', "Getting Location...");
Session.set('mapvis', false);
Session.set('explore', false);
Session.set('homelat', undefined);
Session.set('homelng', undefined);


// in meters
Session.setDefault('accuracy', 30);
Session.setDefault('radius', 1357.9953559153475);

Session.setDefault('total_quickets', 0);
Session.setDefault("sort", sort['new']);
// get user location
Meteor.startup(function () {

  $(document).ready(function() {
    $.getJSON("http://www.telize.com/geoip?callback=?",
      function(json) {
        if(start2 == 2) {
          Session.set('plat', json.latitude);
          Session.set('plng', json.longitude);
          initialize_map();
        }
      }
    );
  });

  var watchID = navigator.geolocation.watchPosition(function(position) {
    if(start2){
      start2 = 1;
    }
    Session.set('homelat', position.coords.latitude);
    Session.set('homelng', position.coords.longitude);
    Meteor.subscribe("housemessages", [Session.get('plng'), Session.get('plat'), Session.get('radius'), Session.get('itemsLimit')]);

    if(!Session.get('explore')) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
      if(!Session.get("media")){
        Session.set("media", 
        "https://maps.googleapis.com/maps/api/streetview?size=300x240&location="+Session.get("homelat")+","+Session.get("homelng"));
      }
      
      //Session.set('accuracy', Math.min(Math.round(position.coords.accuracy), 200));
      //Session.set('radius', Math.max(Session.get('accuracy'), Session.get('radius') ));
      //$("#overlay").delay(1000).fadeOut();
      //$("#outer").delay(2000).css('opacity', '1');
      if(start2){
        start2=0;
        Meteor.call("getyybatch", Session.get("plng") , Session.get("plat"));
        console.log("batch: ", Session.get("plng") , Session.get("plat"));
        initialize_map();
        //var x = document.getElementById("errorhandle");
        //x.innerHTML = "Found Location!"
      }
      var newcenter = new google.maps.LatLng(Session.get("plat"), Session.get("plng"));
      circle.setCenter(newcenter);
      map.setCenter(newcenter);
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
    maximumAge: 15000
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

getLocationInfo = function(mylat, myloc) {
  var url = "http://geocoder.ca/?latt="+ Session.get('plat') +"&longt="+ Session.get('plng') +"&reverse=1&allna=1&geoit=xml&corner=1&json=1&callback=yo"
  Meteor.http.call("GET",url,function(error,result){
    if(mylat == Session.get("plat") && myloc == Session.get("plng")) {
      var city = result.data.city + ", " + result.data.prov;
    var street = result.data.staddress;
    if(!street) {
      street = '';
    }
       Session.set("my place", street);
    if(city == 'undefined, undefined') {
      city = '';
    } 
       Session.set("campus place", city);
    }
    
  });
}



Template.navbar.helpers({
  'mapvisible':function(){
    return Session.get('mapvis');
  }
})




Template.radius.events({
  'click #houserange' : function() {
      var rad = Math.max(Math.round(Session.get("accuracy")),100)
      Session.set("radius", rad);
      map.setCenter(new google.maps.LatLng(Session.get("plat"), Session.get("plng")));
      circle.setRadius(rad);
  }, 

  'dblclick #houserange, dblclick #campusrange' : function() {
      map.fitBounds(circle.getBounds());
  },

  'click #campusrange' : function() {
      var rad = Math.max(Math.round(Session.get("accuracy")),1000)
      Session.set("radius", rad);
      map.setCenter(new google.maps.LatLng(Session.get("plat"), Session.get("plng")));
      circle.setRadius(rad);
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

    google.maps.event.addListener(map, 'dragend', function() {
        Session.set('explore', true);
        var loc = map.getCenter();
        if((Math.abs(loc.lat() - Session.get('plat'))) + (Math.abs(loc.lng() - Session.get('plng'))) > .2) {
          Meteor.call("getyybatch", loc.lng() , loc.lat());
          console.log("batch: ", Session.get("plng") , Session.get("plat"));
        }
        Session.set('plat', loc.lat()); 
        Session.set('plng',loc.lng());
        circle.setCenter(new google.maps.LatLng(Session.get("plat"), Session.get("plng")));
        getLocationInfo(loc.lat(), loc.lng());

    });

    google.maps.event.addListener(map, 'zoom_changed', function() {

      var zoomLevel = map.getZoom();
      //zoomLevel = Math.max(1, zoomLevel - 9);
      var newradius = 2000000*Math.pow(Math.E,-0.562*zoomLevel)+15;
      console.log(zoomLevel, newradius);
      Session.set("radius", newradius);
      circle.setRadius(newradius);

    });
  }



  

  function callback(results, status) {
      console.log(results)
    if (status == google.maps.places.PlacesServiceStatus.OK) {
          //console.log(results[i]);
          Session.set("my place", results[0].name);
          if(results[0].vicinity) {
            Session.set("campus place", results[0].vicinity);
          }
          else{
            Session.set("campus place", "1000 meters");
          }

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
  //Meteor.subscribe("me", cookie);
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

    var numonline = v.count();
    if(numonline < 1) {
      numonline = 1;
    }

    Session.set("online", numonline);
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
  },

  'moreResults' : function () {
    Session.set("itemsLimit", Session.get("itemsLimit") + ITEMS_INCREMENT);
    return true;
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

Template.navbar.events({
  'click #gohome' :function() {
    Session.set("plat", Session.get("homelat"));
    Session.set("plng", Session.get("homelng"));
    Session.set("explore", false);
    var newcenter = new google.maps.LatLng(Session.get("plat"), Session.get("plng"));
    map.setCenter(newcenter);
    circle.setCenter(newcenter);
    getLocationInfo(Session.get("homelat"), Session.get("homelng"));

  },

  'click #mapmarker': function() {
    if(Session.get('mapvis')){
      //$('#messageadding').show(); 
      $('#mapbox').css('visibility', 'hidden'); 
      Session.set('mapvis', false);

    }
    else{
      //$('#messageadding').hide(); 

      $('#mapbox').css({
             'visibility': 'visible',
              width: $(window).width(),
              height: $(window).height(), 
              'z-index': 8
          });
      Session.set('mapvis', true);
    }
  }

})


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
      $(e.currentTarget.parentNode.children[2]).css({
        display:'none'
      });
      $(e.currentTarget.parentNode.children[1]).css({
          position: 'fixed',
          color: 'white',
          
            bottom: 0,
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

  'touchend #mediacontent' : function(e) {
    if(this.media) {
      $(e.currentTarget).css({
            position: 'relative',
            'width': '3.6em',
            'height': '3.8em',
            border:'.1em solid #d1d1d1',
            'margin-top': '1em',
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

Template.addMessage.helpers({

  'ismediapreview' : function() {
    return Session.get("media");
  },
  'isexploring' : function() {
    return Session.get("explore");
  }
});

// post
Template.addMessage.events = {
  'submit form': function (event, template) {
    var msg = messageText.value;
    var privacy = false;

    Meteor.call("post",
      cookie, msg, Session.get("media"), Session.get("plng") , Session.get("plat"), Session.get("radius"), privacy,
      function() {
        messageText.value = "";
        //Session.set("media", "https://maps.googleapis.com/maps/api/streetview?size=300x240&location="+Session.get("homelat")+","+Session.get("homelng"));
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
