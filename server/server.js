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
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: 50 });

  //console.log("getmessages has " + v.fetch().length)

  return v;
}

getMessages = function (loc) {
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
             $centerSphere : [ [ loc[0], loc[1] ] , 1000/6378100 ] 
           }
      },
      author: {$ne: "yy"},
      privacy: false,
      house: {$gt: 100}
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: 50 });

  //console.log("getmessages has " + v.fetch().length)

  return v;
}

getYaks = function(loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = Math.min(+loc[3], 100);
  loc[2] = Math.min(1000, +loc[2]);
  console.log("yaks:", loc);

    var v = MessageDb.find({ 
        location: { 
          $geoWithin :
              {
               $centerSphere : [ [ loc[0], loc[1] ] , 1000/6378100 ] 
             }
        },
        author: "yy"
       } ,
       {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: 50 });
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
Meteor.methods({
  post: function(_cookie, _name, _media, _lng, _lat, _rad, _priv) {

    if((_name.trim() || _media ) && _lat != -1) {
      var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
      console.log(_name.imageify());

      MessageDb.insert({
          name: _name,
          media: _media || _name.imageify(),
          author: _cookie,
          score: upval.num,
          time:(new Date).getTime(),
          clicks: 0, 
          voters: [],
          location: { type: "Point", coordinates: [ _lng , _lat ] },
          house: _rad,
          privacy: _priv
        });
      Website.update(upval._id, {$inc: {num: 1}});

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
  hop: function(cookie, msgid, posneg) {

    var canvote = MessageDb.find({_id: msgid}).fetch()[0].voters.indexOf(cookie);
    //console.log(posneg, Math.abs(posneg));
      if (canvote === -1 && Math.abs(posneg) == 1){
        var upval = Website.find({name: {$in:['upval']}}).fetch()[0];
        MessageDb.update(msgid, {$inc: {score: posneg*upval.num, clicks: posneg*1}});
        MessageDb.update(msgid, {$push: {voters: cookie}});
        Website.update(upval._id, {$inc: {num: 1}});
      }
  }

});



