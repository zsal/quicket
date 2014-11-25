Template.navbar.helpers({
  'mapvisible':function(){
    return Session.get('mapvis');
  }
})

Template.navbar.events({
  'click #gohome' :function() {
    Session.set("plat", Session.get("homelat"));
    Session.set("plng", Session.get("homelng"));
    Session.set("explore", false);
    var newcenter = new google.maps.LatLng(Session.get("plat"), Session.get("plng"));
    map.setCenter(newcenter);
    circle.setCenter(newcenter);
    marker.setPosition(newcenter);
    getLocationInfo(Session.get("homelat"), Session.get("homelng"));

  },

  'click #mapmarker, click #rangeselect': function() {
      toggleMap();
  }

});


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