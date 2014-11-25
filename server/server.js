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

getLocalMessages = function (loc) {
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
      privacy: true
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: loc[3] });

  console.log("getlocalmessages has " + v.count())

  return v;
}

getNewMessages = function (loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = +loc[3];
  loc[2] = +loc[2];

  var v = MessageDb.find({ 
      location: { 
        $geoWithin :
            {
             $centerSphere : [ [ loc[0], loc[1] ] , loc[2]/6378100 ] 
           }
      },
      privacy: false
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: loc[3] });

  console.log("newmsgs:", loc, v.count());

  return v;
}

getHotMessages = function (loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = +loc[3];
  loc[2] = +loc[2];

  var v = MessageDb.find({ 
      location: { 
        $geoWithin :
            {
             $centerSphere : [ [ loc[0], loc[1] ] , loc[2]/6378100 ] 
           }
      },
      privacy: false
     } ,
     {sort: {score: -1, clicks: -1, time: -1, name: 1, location: 1}, limit: loc[3] });

  console.log("hotmsgs:", loc, v.count());
  return v;
}

//Meteor.publish("localmessages", getHouseMessages);
Meteor.publish("newmessages", getNewMessages);
Meteor.publish("hotmessages", getHotMessages);

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
