'use strict';

const SwaggerExpress = require('swagger-express-mw'),

  app = require('express')(),
  swaggerUi = require('swagger-ui-express'),
  yaml = require('yamljs'),
  nodeCleanup = require('node-cleanup'),
  logger = require('./controller/log')(module),
  servicedb = require('./controller/service_db'),
  userdb = require('./controller/user_db'),
  auth = require('./controller/auth')
  ;


/*
 * init databases, exit on error
 */
let err = servicedb.init();
if(err){
  logger.error(err);
  process.exit(1);
}
err = userdb.init();
if(err){
  logger.error(err);
  process.exit(1);
}

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
      logger.info('auth:' + req.headers.authorization);
      // const prefix = 'Basic ';
      // if (req.headers.authorization && req.headers.authorization.startsWith(prefix)) {
      //   const b64string = req.headers.authorization.substr(prefix.length);
      //   const user_pass = Buffer.from(b64string, 'base64').toString();
      // }
      // // put your validation somewhere here
      // auth.authenticated_request( {
      //   strategy: 'basic',
      //   req : req,
      //   res: res,
      //   next: function(err, user) {
      //     if(err){
      //       logger.error('mad world');
      //       // 403 is the default error code, feel free to override with, e.g 401
      //       next({code: 'Custom_application_error_code', statusCode: 401});
      //       return;
      //     }
      //     logger.info('hello world');
      //   }
      // });
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

nodeCleanup(function (exitCode, signal) {
  logger.info('Shutdown server.');
});
