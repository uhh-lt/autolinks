'use strict';

/* some global settings and requirements */
require('../broker/serversetup')(module);
/* browserify browser components */
require('./browserify-app');

/* imports */
const
  express = require('express'),
  app = express(),
  logger = require('../broker/controller/log')(module);

/*
 * init swagger ui
 */
app.use(express.static(__dirname + '/public'));

// // redirect root to swaggers api docs
// app.get('/', function(req, res){
//   res.redirect('api-docs');
// });


app.get('/test', function(req, res){

  res.end();

});

app.listen(10010);

