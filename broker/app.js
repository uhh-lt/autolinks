'use strict';

/* some global settings and requirements */
require('./serversetup')(module);
process.setMaxListeners(0); // prevent: (node:308) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added. Use emitter.setMaxListeners() to increase limit
require('events').EventEmitter.defaultMaxListeners = 100; // prevent: (node:24) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added. Use emitter.setMaxListeners() to increase limit

/* imports */
const
  SwaggerExpress = require('swagger-express-mw'),
  express = require('express'),
  app = express(),
  swaggerUi = require('swagger-ui-express'),
  yaml = require('yamljs'),
  nodeCleanup = require('node-cleanup'),
  servicedb = require('./controller/service_db'),
  userdb = require('./controller/user_db'),
  storage = require('./controller/storage_wrapper'),
  nlp = require('./controller/nlp_wrapper'),
  auth = require('./controller/auth'),
  logger = require('./controller/log')(module);

/*
 * init databases, exit on error
 */
servicedb.init(function(err){
  if(err){
    logger.error(err);
    throw err;
  }
});

userdb.init(function(err){
  if(err){
    logger.error(err);
    process.exit(1);
  }
});

storage.init(function(err){
  if(err){
    logger.error(err);
    process.exit(1);
  }
});

nlp.init(function(err){
  if(err){
    logger.error(err);
    process.exit(1);
  }
});

/*
 * init authentication
 */
auth.init(app);

/*
 * init admin UI
 */
require('./app/browserify');
// serve static
app.use('/admin', express.static(__dirname + '/app/public'));
// serve dynamic content
// app.get('/test', function(req, res, next) {
//   res.end(next);
// });

/*
 * swagger variables
 */
const swaggerDocument = yaml.load('api/swagger/swagger.yaml');
const showSwaggerExplorer = true;

/*
 * init swagger ui
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, showSwaggerExplorer));

// module.exports = app; // for testing
// swagger-express config
const config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    broker_auth: function (req, authOrSecDef, scopesOrApiKey, next) {
      // logger.debug(`basic auth: ${req.headers.authorization}.`);
      next(null);
    }
  }
};

/*
 * start api with swagger-express
 */
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  // install middleware
  swaggerExpress.register(app);
  const port = process.env.PORT || 10010;
  app.listen(port);
  logger.info('server running on port %d.', port);
  logger.log('silly', swaggerExpress.runner.swagger.paths);
});

// redirect root to swaggers api docs
app.get('/', function(req, res){
  res.redirect('api-docs');
});

// cleanup stuff at the end
nodeCleanup(function (exitCode, signal) {
  logger.info('Shutdown server.');
});

// some test function
app.get('/test', function(req, res, next){
  res.write('Hello test');
  res.end(next);
});


