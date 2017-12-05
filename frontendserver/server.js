// set up ======================================================================
var express = require('express');
var app = express(); 						// create our app w/ express
var port = process.env.PORT || 9090; 				// set the port

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/assets'));
app.use('/assets', express.static(__dirname + '/assets/'));

app.listen(port);
console.log("App listening on port " + port);

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes
