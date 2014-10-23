MessageDb = new Mongo.Collection("players");
Website = new Mongo.Collection("website");

MessageDb.allow({
	insert: function(msg) {
		console.log(userId);
		return true;
	}
});