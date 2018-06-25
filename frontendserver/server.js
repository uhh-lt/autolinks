// set up ======================================================================
require('rootpath')();
const express = require('express');
const app = express(); 						// create our app w/ express
const port = process.env.PORT || 9090; 				// set the port
const session = require('express-session');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const config = require('config');
const fileUpload = require('express-fileupload');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(session({ secret: config().secret, resave: false, saveUninitialized: true }));

app.use(fileUpload());

app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost"); // TODO: could be changed when it deploys to the live
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

require('api/routes')(app); // pass our application into our routes

// start server
var server = app.listen(port, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
    console.log('BROKER_URL=' + process.env.BROKER_URL);
});
