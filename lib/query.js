getMessages = function (loc) {
  if(loc[0] === - 1) {
    return MessageDb.find({}, {limit: 1});
  }

  loc[3] = Math.min(+loc[3], 100);
  loc[2] = Math.min(2500, +loc[2]);
  console.log(loc);
  var v = MessageDb.find({ 
      location: { 
        $geoWithin :
            {
             $centerSphere : [ [ loc[0], loc[1] ] , loc[2] ] 
           }
      }
     } ,
     {sort: {time: -1, score: -1, clicks: -1, name: 1, location: 1}, limit: 100 });

  //console.log("getmessages has " + v.fetch().length)

  return v;
}