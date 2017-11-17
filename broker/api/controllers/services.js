'use strict';

const util = require('util')
  , service_db = require('../../controller/service_db')
  , service_utils = require('../../controller/service_utils')
  , logger = require('../../controller/log')
  // , async = require('async')
  ;

module.exports = {
  register_service: register_service,
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
    service.endpoints);

  if(err) {
    logger.warn(`adding service ${service.name} failed.`, service, err, {} );
    res.status(500);
    res.write(JSON.stringify({ message: err.message, fields: { service: service, error: err } }));
  } else {
    logger.info(`added service ${service.name}.`, service);
  }

  res.end();

}

function ping_service(req, res) {
  service_utils.ping_service(req.swagger.params.service.value);
  res.end();
}

function ping_services(req, res) {
  // get all services and apply ping_service as callback for each of the services
  service_db.get_services(service_utils.ping_service, () => res.end());
}

function list_services(req, res, next) {
  res.write('[');
  let startedwriting = false;
  service_db.get_services(
    (service) => {
      startedwriting && res.write(',');
      res.write(JSON.stringify(service));
      startedwriting = true;
    },
    () => {
      res.write(']');
      res.end();
    }
  );
}
