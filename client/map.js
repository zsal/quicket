circle = null;
map = null;
marker = null;
Session.set('mapvis', false);
Session.set('explore', false);


center_map = function() {
  var newcenter = new google.maps.LatLng(Session.get("plat"), Session.get("plng"));
  circle.setCenter(newcenter);
  map.setCenter(newcenter);
  marker.setPosition(newcenter);
}

initialize_map = function() {
    console.log("initializemap", Session.get("plat"), Session.get("plng"));
    var pyrmont = new google.maps.LatLng(Session.get("plat"), Session.get("plng"));
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: pyrmont,
      zoom: 17,
      minZoom:4,
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
    var markerImage = new google.maps.MarkerImage('resources/icons/white.png',
                new google.maps.Size(60, 60),
                new google.maps.Point(0, 0),
                new google.maps.Point(30, 30));

    marker = new google.maps.Marker({
      map: map,
      opacity: .15,
      icon: markerImage,
      position: pyrmont
    });

    circle = new google.maps.Circle({
      map: map,
      strokeColor: "darkgreen",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "darkgreen",
      fillOpacity: .55,
      center: pyrmont,
      radius: Session.get("radius")
    });
    map.fitBounds(circle.getBounds());
    /*
    google.maps.event.addListener(circle, 'click', function() {
      infowindow.setContent("You are here");
      infowindow.open(map, this);
    });*/

    //infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    google.maps.event.addListener(map, 'dragend', function() {
        Session.set('explore', true);
        Session.set("newlimit", ITEMS_INCREMENT);
        Session.set("hotlimit", ITEMS_INCREMENT);
        previoustotal = 0;
        var loc = map.getCenter();
        if((Math.abs(loc.lat() - Session.get('plat'))) + (Math.abs(loc.lng() - Session.get('plng'))) > .2) {
          Meteor.call("getyybatch", loc.lng() , loc.lat());
          console.log("batch: ", Session.get("plng") , Session.get("plat"));
        }
        Session.set('plat', loc.lat()); 
        Session.set('plng',loc.lng());
        center_map();
        getLocationInfo(loc.lat(), loc.lng());

    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
      Session.set("newlimit", ITEMS_INCREMENT);
      Session.set("hotlimit", ITEMS_INCREMENT);
      previoustotal = 0;
      var zoomLevel = map.getZoom();
      //zoomLevel = Math.max(1, zoomLevel - 9);
      var newradius = 2000000*Math.pow(Math.E,-0.562*zoomLevel)+15;
      //console.log(zoomLevel, newradius);
      Session.set("radius", Math.round(newradius));
      circle.setRadius(newradius);

    });
  }



  

  function callback(results, status) {
      //console.log(results)
    if (status == google.maps.places.PlacesServiceStatus.OK) {
          //console.log(results[i]);
          Session.set("my place", results[0].name);
          if(results[0].vicinity) {
            Session.set("campus place", results[0].vicinity);
          }
          else{
            Session.set("campus place", "");
          }
          console.log("going to create marker");

          //createMarker(results[0]);
    }
  }

  function createMarker(place) {
    console.log("creating marker");
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      icon: "resources/icons/icon-60x60.png",
      position: place.geometry.location
    });
  }


/*setPrevTotal = function() {
      //console.log("total quickets: ", previoustotal, Session.get("total_quickets"))
     // previoustotal = Session.get("total_quickets");

}*/

toggleMap = function() {
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
