// set up ======================================================================
require('rootpath')();
var express = require('express');
var app = express(); 						// create our app w/ express
var port = process.env.PORT || 9090; 				// set the port
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');


app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/assets'));
app.use('/assets', express.static(__dirname + '/assets/'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');

// start server
var server = app.listen(port, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

// routes ==================================================
app.use('/login', require('./controllers/loginController'));
app.get('/', function (req, res) {
    res.redirect('/login'); // load the single view file (angular will handle the page changes on the front-end)
});

require('app/routes')(app); // pass our application into our routes
