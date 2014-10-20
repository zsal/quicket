// Set up a collection to contain message information. On the server,
// it is backed by a MongoDB collection named "players".

MessageDb = new Mongo.Collection("players");
Website = new Mongo.Collection("website");
//Parse.initialize("s3bB2gf3m7VMdhzWokei3I324u9Qev1unjAB8YXJ", "z9aoFpoCnTnT22Ev8nA0dtGseLDBaBswlfiEj6T3");

// On server startup, create some messages if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (MessageDb.find().count() === 0) {
    }
    if(Website.find().count() === 0) {
      Website.insert({name: 'total', num: 0});
      Website.insert({name: 'upval', num: 1});
    }
    
  });

  var lamebackup = ["My only aspiration left in college is to find my Umich Crush from last year"];


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
    "mobileapp": [42.289804, -83.714528]
  }


/*
  Meteor.publish("me", function (cookie) {
    return MessageDb.find({author: cookie});
  });

  Meteor.publish("messages", function (location, radius) {
    return MessageDb.find({ 
      location:
       { $near :
          {
            $geometry: { type: "Point",  coordinates: [ Session.get('plng'), Session.get('plat') ] },
            $minDistance: 0,
            $maxDistance: Session.get('radius')
          }
       } 
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit:25});
  });
*/
}
