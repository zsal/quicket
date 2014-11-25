// Google Analytics
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-54737425-1', 'auto');
ga('send', 'pageview');

var lock = false;
// Infinite scroll anticipate + lock
window.onscroll = function(ev) {
  if ((lock == false && window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 ) {
        lock = true;
      if(Session.get("sort") == 'new') {
        console.log("newlimit", Session.get("newlimit"));
        Session.set("newlimit", Session.get("newlimit") + ITEMS_INCREMENT); 
        sort['new'].limit = Session.get("newlimit");
      } else if(Session.get("sort") == 'hot'){
        lock = true;
        console.log("hotlimit", Session.get("hotlimit"));
        Session.set("hotlimit", Session.get("hotlimit") + ITEMS_INCREMENT); 
        sort['hot'].limit = Session.get("hotlimit");
      }
      setTimeout(function() { lock = false;}, 1000);
  }
};

/*
// content for umich?
var lamebackup = "My only aspiration left in college is to find my Umich Crush from last year";
Session.setDefault("closest", null);

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
  "giant magnet": [42.289804, -83.714528]
};
*/