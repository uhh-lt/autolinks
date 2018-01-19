// set up ======================================================================
require('rootpath')();
const express = require('express');
const app = express(); 						// create our app w/ express
const port = process.env.PORT || 9090; 				// set the port
const session = require('express-session');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const config = require('config.json');


// app.use(express.static(__dirname + '/app')); 		// set the static files location /app/img will be /img for users
// app.use(express.static(__dirname + '/assets'));
// app.use('/assets', express.static(__dirname + '/assets/'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// routes ==================================================
app.use('/login', require('./controllers/loginController'));
app.use('/register', require('./controllers/registerController'));
app.use('/app', require('./controllers/appController'));

// Autolinks Broker Service
app.use('/api/service', require('./api/service/servicesEndpoint'));
app.use('/api/nlp', require('./api/nlp/nlpEndpoint'));

app.get('/', function (req, res) {
    res.redirect('/app'); // load the single view file (angular will handle the page changes on the front-end)
});

// require('api/routes')(app); // pass our application into our routes

// start server
var server = app.listen(port, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});
