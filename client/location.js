var start2 = 2;

Session.set('homelat', undefined);
Session.set('homelng', undefined);

Session.setDefault('plat', -1);
Session.setDefault('plng', -1);

Session.setDefault('accuracy', 30);
Session.setDefault('radius', 1000);

Session.setDefault('my place', "Welcome to Quicket!");
Session.setDefault('campus place', "Getting Location...");

// get user location
Meteor.startup(function () {
  if(start2 ==2){
       $.getJSON("http://www.telize.com/geoip?callback=?",
          function(json) {
            if(start2 == 2) {
              Session.set('plat', json.latitude);
              Session.set('plng', json.longitude);
              initialize_map();
            }
          }
        );
    }
  var watchID = navigator.geolocation.watchPosition(function(position) {
    if(start2){
      start2 = 1;
    }
    $("#outer").addClass("faded-in");
    Session.set('homelat', position.coords.latitude);
    Session.set('homelng', position.coords.longitude);

    if(!Session.get('explore')) {
      Session.set('plat', position.coords.latitude);
      Session.set('plng', position.coords.longitude);
      /*if(!Session.get("media") && position.coords.accuracy < 100){
        Session.set("media", "https://maps.googleapis.com/maps/api/streetview?size=300x240&location="+Session.get("homelat")+","+Session.get("homelng"));
      }*/
      
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
      center_map();
    }
  }, function(error) {
    var x = document.getElementById("locationheader");
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
    maximumAge: 5000
  });
   
});


getLocationInfo = function(mylat, myloc) {
  var url = "http://geocoder.ca/?latt="+ Session.get('plat') +"&longt="+ Session.get('plng') +"&reverse=1&allna=1&geoit=xml&corner=1&json=1&callback=yo"
  Meteor.http.call("GET",url,function(error,result){
    if(mylat == Session.get("plat") && myloc == Session.get("plng")) {
      var city = "";
      if(result.data.city) {
        city += result.data.city + ", ";
      }
      city += result.data.prov;
    var street = result.data.staddress;
    if(!street) {
      street = '';
    }
       Session.set("my place", street);
    if(city == 'undefined') {
      city = '';
    } 
       Session.set("campus place", city);
    }
    
  });
}