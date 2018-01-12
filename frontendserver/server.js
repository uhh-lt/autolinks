// set up ======================================================================
require('rootpath')();
const express = require('express');
const app = express(); 						// create our app w/ express
const port = process.env.PORT || 9090; 				// set the port
const session = require('express-session');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const config = require('config.json');


app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/assets'));
app.use('/assets', express.static(__dirname + '/assets/'));

app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');

// start server
var server = app.listen(port, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

// routes ==================================================
app.use('/login', require('./controllers/loginController'));
app.use('/register', require('./controllers/registerController'));

app.get('/', function (req, res) {
    res.redirect('/login'); // load the single view file (angular will handle the page changes on the front-end)
});

require('app/routes')(app); // pass our application into our routes
