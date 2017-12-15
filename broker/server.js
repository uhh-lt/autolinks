'use strict';

/* some global settings and requirements */
process.setMaxListeners(0); // prevent: (node:308) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added. Use emitter.setMaxListeners() to increase limit

/* imports */
const
  SwaggerExpress = require('swagger-express-mw'),
  app = require('express')(),
  swaggerUi = require('swagger-ui-express'),
  yaml = require('yamljs'),
  nodeCleanup = require('node-cleanup'),
  fs = require('fs'),
  servicedb = require('./controller/service_db'),
  userdb = require('./controller/user_db'),
  storage = require('./controller/storage_wrapper'),
  nlp = require('./controller/nlp_wrapper'),
  auth = require('./controller/auth'),
  logger = require('./controller/log')(module)
  ;

/* make sure the data directory exists */
const datadir = './data';
if (!fs.existsSync(datadir)) { fs.mkdirSync(datadir); }

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
  appRoot: __dirname
  , // required config
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

app.get('/test', function(req, res){
  //servicedb.add_service('asadsasd','adasdan', null, [{'name':'asd'}, {'name':'asdad'}]);
  // servicedb.update_service('wikiservice', {
  //   lastseenactive: new Date().getTime(),
  //   active: true
  // });


  // servicedb.delete_service('asadsasd');

  //() => { servicedb.get_services((service) => {
  //   //console.log(`${service.name} ${service.location} ${service.lastseenactive}`);
  //   res.write(JSON.stringify(service));
  // }}

  // async.waterfall([
  //   function(callback) {
  //     res.write('[');
  //     let startedwriting = false;
  //     servicedb.get_services(
  //       (service) => {
  //         startedwriting && res.write(',');
  //         res.write(JSON.stringify(service));
  //         startedwriting = true;
  //       },
  //       () => {
  //         callback(null, 'OK')
  //       });
  //   }
  // ], function (err, result) {
  //     console.log(result);
  //     res.write(']');
  //     res.end();
  //     // result now equals 'done'
  // });

  res.end();

});


