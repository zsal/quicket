Meteor.startup(function () {
  if (MessageDb.find().count() === 0) {
  }
  if(Website.find().count() === 0) {
    Website.insert({name: 'total', num: 0});
    Website.insert({name: 'upval', num: 1});
    Website.insert({name: 'lastfree', num: ""});
  } else if(Website.find().count() === 2) {
    Website.insert({name: 'lastfree', num: ""});
  }
});

getHouseMessages = function (loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = Math.min(+loc[3], 100);
  loc[2] = Math.min(1000, +loc[2]);
  console.log("msgs:", loc);

  var v = MessageDb.find({ 
      location: { 
        $geoWithin :
            {
             $centerSphere : [ [ loc[0], loc[1] ] , 100/6378100 ] 
           }
      },
      author: {$ne: "yy"},
      privacy: false
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: loc[3] });

  console.log("gethousemessages has " + v.fetch().length)

  return v;
}

getMessages = function (loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = Math.min(+loc[3], 100);
  loc[2] = +loc[2];
  console.log("msgs:", loc);

  var v = MessageDb.find({ 
      location: { 
        $geoWithin :
            {
             $centerSphere : [ [ loc[0], loc[1] ] , loc[2]/6378100 ] 
           }
      },
      author: {$ne: "yy"},
      privacy: false,
      house: {$gt: 100}
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: loc[3] });

  console.log("getmessages has " + v.fetch().length)

  return v;
}

getYaks = function(loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = Math.min(+loc[3], 100);
  //loc[2] = Math.min(1000, +loc[2]);
  console.log("yaks:", loc);

    var v = MessageDb.find({ 
        location: { 
          $geoWithin :
              {
               $centerSphere : [ [ loc[0], loc[1] ] , loc[2]/6378100 ] 
             }
        },
        author: "yy"
       } ,
       {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: loc[3] });
  console.log("getyaks has " + v.fetch().length)

    return v;
}

Meteor.publish("yaks", getYaks);
Meteor.publish("housemessages", getHouseMessages);
Meteor.publish("messages", getMessages);

Meteor.publish("website", function() {
  return Website.find();
});

Meteor.publish('userPresence', function() {
  // Example of using a filter to publish only "online" users:
  var filter = {state: "online"};
  return UserPresences.find(filter);
});

Meteor.publish("me", function (cookie) {
  if(cookie) {
    var v = MessageDb.find({ $or: [ { author: cookie }, { voters: {$in: [cookie]} } ] });
    //console.log(cookie + " has " + v.count());
    return v;
  }
});

// todo: add Meteor methods instead of insecure client
var recent = 0;
var recentlng = -1;
var recentlat = -1;


Meteor.methods({
  post: function(_cookie, _name, _media, _lng, _lat, _rad, _priv) {

    if((_name.trim() || _media ) && _lat != -1) {
      //var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
      //console.log(_name.imageify());

      MessageDb.insert({
          name: _name,
          media: _media || _name.imageify(),
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
            if(_batch[b]['message'] == 'There are no Yaks in your area. Why not start a new herd?') {

            } else if(MessageDb.findOne({name:_batch[b]['message'], time:_batch[b]['time']})) {
              
            } else {
              curtime = (new Date).getTime();
              if(_batch[b]['time'] > curtime) {
                _batch[b]['time'] = curtime;
              }
              MessageDb.insert({
                name: _batch[b]['message'],
                media: "https://pbs.twimg.com/profile_images/487613331360858115/XP1PspM3.png",
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

    if(((new Date).getTime() - recent) < 600000 && Math.abs(recentlat - lat) + Math.abs(recentlng - lng) < .2) {
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



