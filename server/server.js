Meteor.startup(function () {
  if (MessageDb.find().count() === 0) {
  }
  if(Website.find().count() === 0) {
    Website.insert({name: 'total', num: 0});
    Website.insert({name: 'upval', num: 1});
  }
  
});

Meteor.publish("messages", getMessages);

Meteor.publish("website", function() {
  return Website.find();
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
  post: function(msg) {
  
  },
  hop: function() {

  }

});



