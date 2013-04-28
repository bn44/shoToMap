
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var watchr = require('watchr');
var fs = require('fs');
var sio = require('socket.io');
    


    
var app = express();

var server = http.createServer(app);


// attaching the socket.io
io = sio.listen(server);

// all environments
app.set('port', process.env.PORT || 3698);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




//to keep track of the masseges on the chat
var messages = [];
//to transport the images information!
var notes = [];
var points = [];
var pointsJson=JSON.stringify(points);
    // Define a message handler
    io.sockets.on('connection', function (socket) {
      io.sockets.emit('map',points); 
	
      socket.on('message', function (msg) {
          console.log('Received: ', msg);
          messages.push(msg);
          socket.broadcast.emit('message', msg);
      });
    
        // send messages to new clients
      messages.forEach(function(msg) {
          socket.send(msg);
      });
      
      notes.forEach(function(notes) {
          socket.send(notes);
      });
      
      points.forEach(function(points) {
          socket.send(points);
      });
	
    });  
				
    function Report(notes) {
	io.sockets.emit('notes', notes);
    };
    
    function features(points) {
      io.sockets.emit('map',points); 
    };
    

console.log('Watch our paths');
watchr.watch({
    paths: ['./public/watched'],
    
    //intervals: 2000, 
    preferredMethods: ['watchFile','watch'],
    listeners: {
        
        error: function(err){
            console.log('an error occured:', err);
        },
        watching: function(err,watcherInstance,isWatching){
            if (err) {
                console.log("watching the path " + watcherInstance.path + " failed with error", err);
            } else {
                console.log("watching the path " + watcherInstance.path + " completed");
            }
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
	    
	    var filePathSplit = filePath.split("/");
            var folderName = filePathSplit[1];
            var fileName = filePathSplit[2];
            var pubPath = folderName+'/'+fileName;
	    
	    console.log("___________Any File Change Info.______________");
	    console.log('Notes --------------->: ' + notes[notes.length-1]);
	    console.log('Change Type --------->: ' + changeType);
	    console.log('file Current State--->: ' + fileCurrentStat);
	    console.log('file Previous State-->: ' + filePreviousStat);
            console.log('url array:----------->: ' + filePathSplit[0]+' '+filePathSplit[1]+' '+filePathSplit[2]);
	    
	    console.log("------------------------------------------");
	   
	// extract the exif data from the image that is newly created			
	    if (changeType === 'create') {
		//code
		var ExifImage = require('exif').ExifImage;
		 try {
		     new ExifImage({ image : filePath }, function (error, image) {
			 if (error){
			     console.log('Error: '+error.message);
			} else{
			   
			     console.log(image);
			     console.log("_______________________________");			    
			     console.log(image.gps[3].tagName); 
			     console.log(image.gps[3].value[0]);
			     console.log(image.gps[1].tagName); 
			     console.log(image.gps[1].value[0]);
			     console.log("-------------------------------");
			     
                             /////// finding the right long and latitude with refereces ////
			     var longRef = image.gps[2].value;
			     var longNum = image.gps[3].value[0];
			     if (longRef == 'W') {
			      var finalLong = -1 * longNum;
			     }else{
			      var finalLong = longNum;
			     }
			     
			     
			     var latRef = image.gps[0].value;
			     var latNum = image.gps[1].value[0];		  
			     if (latRef == 'N') {
			      var finalLat = latNum;
			     }else{
			      var finalLat = -1 * latNum;
			     }
			     
			     //////////////////////////////

			     
			     
                             points.push({geometry: {type: "Point", coordinates: [finalLong, finalLat]},
					properties: {
					  url: pubPath, // filePhath
					  Make: image.image[0].value,
					  Model: image.image[1].value,
					  When: image.image[7].value}
					});
			var pointsJson = JSON.stringify(points);
			    features(points);
			
                             console.log(points[0].properties.url);		  
			    
     			     console.log("_______________________________");
		             // lets do some JSON! 
			     var imageJson = JSON.stringify(image);
			     notes.push(changeType + ' ' + filePath);
			     
			     
			     
			     //Report('Change Repport--------------->  : ' + notes[notes.length-1] );
			     //Report('The Location of This Image is ------>:'+image.gps[5].tagName);
			     //console.log(imageJson);
			     console.log("-------------------------------");
 
			    }		     
		      });
		     
			    
		     
		     
		     
		 } catch (error) {
		     console.log('Error (while extracting location data from the image): ' + error);
		 }	

	    }	
		
        }
    },
    next: function(err,watchers){
        if (err) {
            return console.log("watching everything failed with error", err);
        } else {
            //console.log('watching everything completed', watchers);
	    return console.log('watching everything completed');
        }
    }
    
});
