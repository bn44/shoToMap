//var test = require('testFunc.js');
 
 
$(function(){
    var socket = io.connect();
    socket.on('connect', function () {
        
        socket.on('message', function(message) {
        $('#messages').append($('<li></li>').text(message));
        });
        socket.on('notes', function(notes){
        $('#notes').append($('<li></li>').text(notes));
        });
        socket.on('disconnect', function() {
        $('#messages').append('<li>Disconnected</li>');
        });
        
    });
    
    var el = $('#chatmsg');
    $('#chatmsg').keypress(function(e) {
        
        if(e.which == 13) {
        e.preventDefault();
        socket.send(el.val());
        $('#messages').append($('<li></li>').text(el.val()));
        el.val('');
        }
        
    });
});