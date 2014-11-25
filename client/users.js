Session.setDefault('online', 1);

UserPresence.data = function() {
  return {
    location: [ Session.get("homelng") , Session.get("homelat") ] 
  };
}

Tracker.autorun(function() {
    var v = UserPresences.find({
      'data.location': { 
        $near :[ Session.get("homelng"), Session.get("homelat") ],
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