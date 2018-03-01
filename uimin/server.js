'use strict';

/* some global settings and requirements */
require('../broker/serversetup')(module);

/* browserify browser components, require runs methods */
require('./browserify-app');

/* imports */
const
  express = require('express'),
  app = express(),
  logger = require('../broker/controller/log')(module);

/*
 * serve static
 */
app.use(express.static(__dirname + '/public'));


/*
 * serve dynamic content
 */
app.get('/test', function(req, res, next) {
  res.end(next);
});

/*
 * start server on port
 */
app.listen(10010);

