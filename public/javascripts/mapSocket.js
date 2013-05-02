$(function(){
            var socket = io.connect();
            
                socket.on('connect', function () {
                  var map = mapbox.map('map');
                  map.addLayer(mapbox.layer().id('bn44.map-ycmv6eza'));
                  
                  socket.on('map', function(points){
                    
                    var markerLayer = mapbox.markers.layer().features(points);
                    var interaction = mapbox.markers.interaction(markerLayer);
                    map.addLayer(markerLayer);
                                    
                    interaction.formatter(function(points) {
                        var o = '<p id="device">' + points.properties.Make + ' ' + points.properties.Model + '</p>'+
                            '<div id="ImageWraper"><img id="tipImage" src="' + points.properties.url + '"  ></div>' +
                            '<p id="when">' + points.properties.When + '</p>';
                            return o;
                    });
                }); 
                      // Set iniital center and zoom
                      map.centerzoom({lat: 41,lon: -73}, 7);
          
            });
          });