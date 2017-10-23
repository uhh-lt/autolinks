'use strict';

const util = require('util')
  , request = require('request')
  , db = require('../../model/db')
  , async = require('async')
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
function register_service(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  const svc = req.swagger.params.service.value || { "name": "not a service" };
  // this sends back a JSON response which is a single string
  // console.log(res);

  // if(error) {
  //   return next(err.message);
  // }

  res.setHeader('Content-Type', 'application/json');
  //res.end(JSON.stringify(result[0] || {}, null, 2));
  res.end(svc);


}

function install_service(service) {

}

function ping_service(service) {

  request(`${service.location}/ping`, function (error, response, body) {
    // TODO:
    // // on success
    // db.update_service('asadsasd', {
    //   lastseenactive: new Date().getTime(),
    //   active: true
    // });
    //
    // // on failure
    // db.update_service('asadsasd', {
    //   active: false
    // });

    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  });


}

function ping_services() {
  // get all services and apply ping_service as callback for each of the services
  db.get_services(ping_service);
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
