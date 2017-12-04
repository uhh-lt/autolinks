'use strict';

const
  auth = require('../../controller/auth'),
  service_db = require('../../controller/service_db'),
  service_utils = require('../../controller/utils/service_utils'),
  logger = require('../../controller/log')(module)
  ;

module.exports = {
  register_service: register_service,
  deregister_service: deregister_service,
  list_services: list_services,
  ping_services: ping_services,
  ping_service: ping_service,
  call_service : callService,
  get_service_details : getServiceDetails,
};

/*
  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function register_service(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  const service = req.swagger.params.service.value;

  const err = service_db.add_service(
    service.name,
    service.location,
    service.description,
    service.endpoints
  );

  res.header('Content-Type', 'application/json; charset=utf-8');
  if(err) {
    logger.warn(`Adding service '${service.name}' failed.`, service, err, {} );
    res.status(500);
    res.write(JSON.stringify({ message: err.message, fields: { service: service, error: err } }));
  } else {
    logger.info(`Sucessfully added service '${service.name}'.`, service);
  }
  res.end();

}

function deregister_service (req, res) {
  const service = req.swagger.params.service.value;
  const err = service_db.delete_service(service.name);
  res.header('Content-Type', 'application/json; charset=utf-8');
  if(err){
    logger.warn(`De-register service '${service.name}' failed.`, service, err, {} );
    res.status(500);
    res.json({ message: err.message, fields: { service: service, error: err } });
  } else {
    logger.info(`Sucessfully removed service '${service.name}'.`, service);
  }
  res.end();
}

function ping_service(req, res) {
  const service = req.swagger.params.service.value;
  const err = service_utils.ping_service(service);
  res.header('Content-Type', 'application/json; charset=utf-8');
  if(err){
    logger.warn(`Ping service '${service.name}' failed.`, service, err, {} );
    res.status(500);
    res.json({ message: err.message, fields: { service: service, error: err } });
  }
  res.end();
}


function ping_services(req, res) {
  // get all services and apply ping_service as callback for each of the services
  const err = service_db.get_services(service_utils.ping_service, () => res.end());
  res.header('Content-Type', 'application/json; charset=utf-8');
  if(err){
    logger.warn('Ping all services failed.', err, {} );
    res.status(500);
    res.json({ message: err.message, fields: { error: err } });
  }
  res.end();

}

function list_services(req, res) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.write('[');
  let startedwriting = false;
  service_utils.get_services_and_endpoints(
    (service) => {
      if(startedwriting) { res.write(','); };
      res.write(JSON.stringify(service));
      startedwriting = true;
    },
    () => {
      res.end(']');
    }
  );
}

function callService(req, res, next) {

  if(!req.swagger.params.data || !req.swagger.params.data.value){
    const msg = 'No data provided.';
    logger.warn(msg);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(500);
    res.json({ message: msg });
    return res.end(next);
  }
  const data = req.swagger.params.data.value;

  if(!(data.service && data.path && data.method)){
    const msg = 'No proper location provided.';
    logger.warn(msg, data);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(500);
    res.json({ message: msg, fields: data });
    return res.end(next);
  }

  service_db.get_service_endpoint(
    {name: data.service},
    {path: data.path, method: data.method},
    function(err, row){
      if (err) {
        const msg = 'Error retrieving service endpoint.';
        logger.warn(msg, data);
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.status(500);
        res.json({ message: msg, fields: data });
        return res.end(next);
      }
      if(!row) {
        const msg = `Service endpoint not found: service: '${serviceref}', endpoint: '${endpointref}'.`;
        logger.warn(msg, data);
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.status(500);
        res.json({ message: msg, fields: data });
        return res.end(next);
      }
      if(row.requireslogin){
        return auth.handle_authenticated_request(req, res, function(user) {
          return service_utils.call_service(row.location, row.path.replace(/\{username\}/,user.name), row.method, data.data, req, res, next);
        });
      }
      return service_utils.call_service(row.location, row.path, row.method, data.data, req, res, next);
    });

}

function getServiceDetails(req, res, next) {

  if(!req.swagger.params.data || !req.swagger.params.data.value){
    const msg = 'No data provided.';
    logger.warn(msg);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(500);
    res.json({ message: msg });
    return res.end(next);
  }
  const data = req.swagger.params.data.value;

  if(!data.name){
    const msg = 'No proper service name provided.';
    logger.warn(msg, data);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(500);
    res.json({ message: msg, fields: data });
    return res.end(next);
  }

  service_utils.get_service_details(data.name, data.extended, function(err, service) {
    if(err) {
      const msg = 'Error while getting service details.';
      logger.warn(err.message);
      logger.warn(msg);
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.status(500);
      res.json({message: msg, fields: err.message});
      return res.end(next);
    }
    if(!service){
      const msg = 'Service not found.';
      logger.warn(err.message);
      logger.warn(msg);
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.status(500);
      res.json({message: msg, fields: err.message});
      return res.end(next);
    }
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.write(JSON.stringify(service));
    res.end(next);
    }
  );

}
