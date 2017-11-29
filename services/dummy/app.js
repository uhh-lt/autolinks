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
  os = require("os"),
  fs = require('fs')
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
global.serviceDefinition = (() =>{
  // console.log(swaggerDocument);
  return {
    name : swaggerDocument.info.title,
    description : swaggerDocument.info.description,
    location : `http://${os.hostname()}:${port}`,
    endpoints: Object.keys(swaggerDocument.paths)
      .filter(p => !p.startsWith('/service/'))
      .map(p => {
      return {
        name : p,
        requireslogin : p.endsWith('{username}'),
      };
    })
  };
})();
console.log('Service Definition: ', global.serviceDefinition);

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


