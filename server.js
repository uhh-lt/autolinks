// set up ======================================================================
var express = require('express');
var app = express(); 						// create our app w/ express
// var mongoose = require('mongoose'); 				// mongoose for mongodb
var port = process.env.PORT || 8080; 				// set the port

app.use(express.static('./public')); 		// set the static files location /public/img will be /img for users

app.listen(port);
console.log("App listening on port " + port);
