// todo: add Meteor methods instead of insecure client
var recent = 0;
var recentlng = -1;
var recentlat = -1;
var mediachoices = ["https://pbs.twimg.com/profile_images/487613331360858115/XP1PspM3.png", 
  "https://pbs.twimg.com/profile_images/487613331360858115/XP1PspM3.png", 
  "https://pbs.twimg.com/profile_images/487613331360858115/XP1PspM3.png", 
  "https://pbs.twimg.com/profile_images/487613331360858115/XP1PspM3.png", 
                    "/resources/splash/splash-thin.png",
                    "https://pbs.twimg.com/profile_images/487613331360858115/XP1PspM3.png"];

Meteor.methods({
  post: function(_cookie, _name, _media, _lng, _lat, _rad, _priv) {

    if((_name.trim() || _media!="/resources/splash/splash-thin.png" ) && _lat != -1) {
      //var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
      //console.log(_name.imageify());

      MessageDb.insert({
          name: _name,
          media: _media || _name.imageify() || "/resources/splash/splash-thin.png",
          author: _cookie,
          score: 0,
          time:(new Date).getTime(),
          clicks: 0, 
          voters: [],
          location: { type: "Point", coordinates: [ _lng , _lat ] },
          house: _rad,
          privacy: _priv
        });
      //Website.update(upval._id, {$inc: {num: 1}});

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

      return true;
    }

    return false;
  },
  yybatch: function(password, _batch) {

    if(password === "fac3bookpants") {
     // var bulk = db.items.initializeUnorderedBulkOp();
      for(b in _batch) {

        //var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
        //console.log(_name.imageify());
        try {
          if(_batch[b] != undefined && _batch[b]['message']) {
            //console.log(b, _batch[b])
            if(_batch[b]['message'] == 'There are no Yaks in your area. Why not start a new herd?'
              || _batch[b]['message'] == "You appear to be using this too close to a school. Yik Yak is for adults only.") {

            } else if(MessageDb.findOne({name:_batch[b]['message'], time:_batch[b]['time']})) {
              
            } else {
              curtime = (new Date).getTime();
              if(_batch[b]['time'] > curtime) {
                _batch[b]['time'] = curtime;
              }

              var choice = Math.floor(Math.random()*5);
              var _media = mediachoices[choice];
              // var latLng = new google.maps.LatLng(_batch[b]['latitude'], _batch[b]['longitude']);
              // streetViewService.getPanoramaByLocation(latLng, STREETVIEW_MAX_DISTANCE, function (streetViewPanoramaData, status) {
              //     if (status === google.maps.StreetViewStatus.OK) {
              //         _media = mediachoices[2];
              //         _media += _batch[b]['latitude'] +"," + _batch[b]['longitude'];
              //         choice = 2;
              //     } 
              //     else {
              //       choice = Math.random();
              //       if(choice > .8) {
              //         _media = mediachoices[1];
              //       } else{
              //         _media = mediachoices[0];
              //       }
              //     }
              // });

              MessageDb.insert({
                name: _batch[b]['message'],
                media: _media,
                author: "yy",
                score: _batch[b]['likes'],
                time: _batch[b]['time'],
                clicks: _batch[b]['likes'], 
                voters: [],
                location: { type: "Point", coordinates: [ _batch[b]['longitude'] , _batch[b]['latitude'] ] },
                house: 1000,
                privacy: false,
                insertedat:curtime
              });

            }
        }
      }
      catch(err) {
        console.log(err, _batch[b]);
      }
      //bulk.execute();
      
      }
      return true;
    }
    

    return false;
  },

  getyybatch: function(lng, lat) {
    console.log(lat, lng);

    if(((new Date).getTime() - recent) < 1000 && Math.abs(recentlat - lat) + Math.abs(recentlng - lng) < .2) {
      console.log("repeat batch, no can do!");
      return;
    }
    recentlat = lat;
    recentlng = lng;
    recent = (new Date).getTime();
      var v = MessageDb.findOne({ 
                location: { 
                  $geoWithin :
                      {
                       $centerSphere : [ [ lng, lat ] , 5000/6378100 ] 
                     }
                },
                author: "yy",
                insertedat: {$gte: recent - 450000}
               });

      if(!v ) {
        console.log("actually made batch request ", lat, lng)
        var urly = "https://intense-taiga-2666.herokuapp.com/?lat="+ lat +"&lng="+ lng;
        Meteor.http.call("GET", urly, {headers: {"User-Agent": "Meteor/1.0"}}, function(error,result){});
      }
     

  },
  hop: function(cookie, msgid, posneg) {
    var canvote = MessageDb.find({_id: msgid}).fetch()[0].voters.indexOf(cookie);
    //console.log(posneg, Math.abs(posneg));
      if (canvote === -1 && Math.abs(posneg) == 1){
        //var upval = Website.find({name: {$in:['upval']}}).fetch()[0];

        MessageDb.update(msgid, {$inc: {score: posneg, clicks: posneg*1}});

        MessageDb.update(msgid, {$push: {voters: cookie}});

        //Website.update(upval._id, {$inc: {num: 1}});
      }
  }

});



