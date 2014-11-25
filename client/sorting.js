sort = {
  "new": {sort: {time: -1, score: -1, clicks: -1}, limit: 10},
  "hot": {sort: {score: -1, clicks: -1, time: -1}, limit: 10}
};

Session.setDefault("sort", "new");

Template.Sorting.events({
  'click #New' : function(e) {
      Session.set("sort", "new" );
  }, 

  'click #Hot' : function(e) {
      Session.set("sort", "hot" );
  },

  'click #Me' : function(e) {
      Session.set("sort", "me" );
  }
});