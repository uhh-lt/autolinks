'use strict';

/* some global settings and requirements */
// process.setMaxListeners(0); // prevent: (node:308) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added. Use emitter.setMaxListeners() to increase limit

/**
 * imports
 **/
const SwaggerExpress = require('swagger-express-mw'),
  swaggerUi = require('swagger-ui-express'),
  app = require('express')(),
  util = require('util'),
  yaml = require('yamljs'),
  nodeCleanup = require('node-cleanup'),
  os = require('os'),
  request = require('request')
;

/**
 * init swagger ui
 */
const port = process.env.PORT || 10010;
const swaggerDocument = yaml.load('api/swagger/swagger.yaml');
const showSwaggerExplorer = true;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, showSwaggerExplorer));

/**
 * swagger-express config
 */
const config = {
  appRoot: __dirname
};

/**
 * start api with swagger-express
 */
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  // install middleware
  swaggerExpress.register(app);
  app.listen(port);
  console.log(util.format('server running on port %d.', port));
});

/**
 * redirect root to swaggers api docs
 */
app.get('/', function(req, res){
  res.redirect('api-docs');
});

/**
 * provide the service description in a global variable
 * reuse the swaggerDocument to create the service definition
 */
global.serviceDefinition = (() => {
  // console.log(swaggerDocument);
  return {
    name : swaggerDocument.info.title,
    description : swaggerDocument.info.description,
    version : swaggerDocument.info.version,
    location : `http://${os.hostname()}:${port}`,
    endpoints: Object.keys(swaggerDocument.paths)
      .filter(p => !p.startsWith('/service/') && !p.startsWith('/swagger') && !p.startsWith('/ping'))
      .map(p => {
      return {
        path : p,
        requireslogin : p.endsWith('{username}'),
        method: swaggerDocument.paths[p].post && 'post' || 'get'
      };
    })
  };
})();
console.log('Service Definition: ', global.serviceDefinition);

/**
 * register at broker
 */
(function registerAtBroker() {

  // wait while global.serviceDefinition is not available
  if(!global.serviceDefinition) {
    util.debuglog('Waiting for service definition to be computed.');
    return setTimeout(registerAtBroker, 1000);
  }

  const location = process.env.BROKER_URL || 'http://broker:10010';
  console.log(`Registering self at broker at '${location}'.`);
  const options = {
    url : '/service/registerService',
    baseUrl : location,
    method : 'POST',
    headers : {
      'accept' : 'application/json',
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(global.serviceDefinition),
  };
  request(options, function (error, response, body) {
    if(error || response.statusCode !== 200){
      const msg = `Registering self at '${location}' failed.`;
      console.warn(msg);
      return console.warn(error || response);
    }
    console.log(`Sucessfully registered service at '${location}'.`);
  });

})();


/**
 * cleanup on shutdown
 */
nodeCleanup(function (exitCode, signal) {
  console.log('Shutdown server.');
});

/**
 * Write some testing code here
 */
app.get('/test', function(req, res){
  res.end('test');
});


