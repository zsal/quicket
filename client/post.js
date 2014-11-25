
Session.set("media", "/resources/splash/splash-thin.png");

Template.addMessage.helpers({

  'ismediapreview' : function() {
    return Session.get("media") && Session.get("media") !='/resources/splash/splash-thin.png';
  },
  'isexploring' : function() {
    return Session.get("explore");
  }
});
function gotPic(event) {
        console.log("lets try this!");
        if(event.target.files.length == 1 &&  event.target.files[0].type.indexOf("image/") == 0) {
            var reader = new FileReader(); 
            reader.readAsDataURL(event.target.files[0]);
            reader.onloadend = function () {
              Session.set("media", reader.result);
            }
            console.log(event);
            console.log("gotpic!");
        }
      }
$(document).ready(function() {
$("#uploadimg").on("change",gotPic);
});
// post
Template.addMessage.events = {
  'submit form': function (event, template) {
    var msg = messageText.value;
    var privacy = false;

    Meteor.call("post",
      cookie, msg, Session.get("media"), Session.get("plng") , Session.get("plat"), Session.get("radius"), privacy,
      function(err, data) {
        if(err)
        console.log(err);
          
        }
    );

    messageText.value = "";
    Session.set("media", "/resources/splash/splash-thin.png");

    event.preventDefault();
    event.stopPropagation();
    return false; 
  },
  'click #addlink' : function () {
    var msg = messageText.value;
    var linkprev = msg.imageify();
    if(linkprev) {
      Session.set('media', linkprev);
    }
  },
'click #addstreetview' : function () {
      Session.set("media", "https://maps.googleapis.com/maps/api/streetview?size=300x240&location="+Session.get("homelat")+","+Session.get("homelng"));
      
  },
  'click #addphoto' : function () {
      var cameraOptions = {
        width: 600,
        height: 800
      };

      MeteorCamera.getPicture(cameraOptions, function (error, data) {
        if(data) {
          Session.set("media", data);
          /*Meteor.call("post", cookie, data, Session.get("plng") , Session.get("plat"), function() {
            messageText.value = "";
          });*/
        }
        else{

        }
      });
  }
};
