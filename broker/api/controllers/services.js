'use strict';

const util = require('util')
  , db = require('../../model/service_db')
  , mx = require('../../model/service_utils')
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
  console.log(`adding service ${service}.`);

  db.add_service(
    service.name,
    service.location,
    service.description,
    service.endpoints);

  res.end();

}

function ping_service(req, res) {
  mx.ping_service(req.swagger.params.service.value);
  res.end();
}

function ping_services(req, res) {
  // get all services and apply ping_service as callback for each of the services
  db.get_services(mx.ping_service, () => res.end());
}

function list_services(req, res, next) {
  res.write('[');
  let startedwriting = false;
  db.get_services(
    (service) => {
      startedwriting && res.write(',');
      res.write(JSON.stringify(service));
      startedwriting = true;
    },
    () => {
      // console.log('OK');
      res.write(']');
      res.end();
    }
  );
}
