'use strict';

const util = require('util')
  , service_db = require('../../controller/service_db')
  , service_utils = require('../../controller/service_utils')
  , logger = require('../../controller/log')(module)
  // , async = require('async')
  ;

module.exports = {
  register_service: register_service,
  deregister_service: deregister_service,
  list_services: list_services,
  ping_services: ping_services,
  ping_service: ping_service
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
  service_db.get_services(
    (service) => {
      startedwriting && res.write(',');
      res.write(JSON.stringify(service));
      startedwriting = true;
    },
    () => {
      res.end(']');
    }
  );
}
