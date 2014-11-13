function Facebook(accessToken) {
    this.fb = Meteor.npmRequire('fbgraph');
    this.accessToken = accessToken;
    this.fb.setAccessToken(this.accessToken);
    this.options = {
        timeout: 3000,
        pool: {maxSockets: Infinity},
        headers: {connection: "keep-alive"}
    }
    this.fb.setOptions(this.options);
}
Facebook.prototype.query = function(query, method) {
    var self = this;
    var method = (typeof method === 'undefined') ? 'get' : method;
    var data = Meteor.sync(function(done) {
        self.fb[method](query, function(err, res) {
            done(null, res);
        });
    });
    return data.result;
}

Facebook.prototype.getFreeloaders = function() {
  return this.query("276163752445190/posts?limit=1");
}

Meteor.startup(function () {
	facebookid = Meteor.setInterval(function () {
      	var fb = new Facebook('1575489969346964|256fe8771674511a46c5043ab4158f14');
	    var data = fb.getFreeloaders(); 
	    var msgname = data.data[0].message;
	    var lastfree = Website.find({name: 'lastfree'}).fetch()[0].num;
	    console.log(msgname);
	    if(lastfree !== msgname) {
	    	MessageDb.insert({
				name: msgname, 
				clicks: 0, 
				author: "free", 
				location: { type: "Point", coordinates: [ -83.738196 , 42.276922 ]}, 
				time: (new Date).getTime(), 
				voters: [], 
				score: 100
			});

	    	Website.update({"name": 'lastfree'}, {$set: {"num": msgname}});
	    	
	   		console.log("posted! lastfree =", Website.find({name: 'lastfree'}).fetch()[0].num);
	    } 
    }, 3600 * 1000);
	
});