'use strict';

// imports
const
  _ = require('lodash'),
  db = require('../service_db'),
  request_utils = require('./request_utils'),
  logger = require('../log')(module)
;

// ping a service
module.exports.ping_service = function(service, callback) {

  let location = service.location;

  if(!location){
    return db.get_service(service.name, service.version, (err, row) => {
      if(err){
        return callback(err);
      }
      if(!row.location){
        return callback(new Error(`No URL location for service '${service.name}:${service.version}' found.`));

      }
      module.exports.ping_service(row, callback);
    });
  }

  const url = `${location}/ping`;
  request_utils.promisedRequest(url)
    .then(
      res => {
        const now = new Date().getTime();
        logger.debug(`ping service '${service.name}' success.`);
        // if service was not active before print an info, otherwise ignore it
        if(!service.active) {
          logger.info(`Service '${service.name}' is now available.`);
        }
        return db.update_service(
          service.name,
          service.version,
          {
            lastseenactive: now,
            lastcheck: now,
            active: true
          },
          function(err){
            if(err){
              // log err but ignore in callback
              logger.warn(`Could not update service: '${service.name}:${service.version}'.`);
              logger.warn(err);
            }
            callback();
          }
        );
      },
      err => {
        const now = new Date().getTime();
        // if service was active before print a warning, otherwise ignore it
        if(service.active) {
          logger.warn(`Cannot reach service '${service.name}:${service.version}'`, { service : service , error: err });
          logger.warn(`Setting service '${service.name}:${service.version}' to defunct.`);
        }
        logger.warn(`ping service '${service.name}:${service.version}' failed.`);
        return db.update_service(
          service.name,
          service.version,
          {
            lastcheck: now,
            active: false
          },
          function(err2) {
            if(err2){
              err.message = err.message + ' AND ' + err2.message;
            }
            callback(err);
          });
      });

};

// ping all registered services
module.exports.ping_services = function() {
  db.get_services ( function(err, service){
    if(err){
      /* ignore */
      return;
    }
    module.exports.ping_service(service, function(err){
      /* ignore */
      return;
    });
  },
  function(err, numrows) {
    /* ignore */
  });
};

// get the services + endpoints
module.exports.get_services_and_endpoints = function(callback_service, callback_done){
  db.get_joined_services_and_endpoints(function(err, rows) {
    if(err) {
      const newerr = new Error('Could not query service-endpoint joins.');
      newerr.cause = err;
      logger.warn(newerr.message, err);
      return callback_done(newerr);
    }
    remap_joined_service_endpoint_rows(rows)
      .forEach(s => callback_service(null, s));
    callback_done(null, remap_joined_service_endpoint_rows.length);
  });
};

// get a service and its endpoints
module.exports.get_service_and_endpoints = function(servicename, callback) {
  db.get_joined_service_and_endpoints(servicename, function(err, rows) {
    if(err) {
      const newerr = new Error('Could not query service-endpoint joins.');
      newerr.cause = err;
      logger.warn(newerr.message, err);
      return callback(newerr, null);
    }
    const services = remap_joined_service_endpoint_rows(rows);
    if(services.length < 1) {
      // TODO: no service found
    }
    if(services.length > 1) {
      // TODO: too many services found, why??
    }
    callback(null, services[0]);
  });
};


/**
 *
 * @param rows
 */
function remap_joined_service_endpoint_rows(rows) {
  return _(rows).groupBy(r => r.name) // group by service name
    .map((v,k) => { // reformat row
      return {
        name : k,
        version : v[0].version,
        location : v[0].location,
        description : v[0].description,
        registeredsince : v[0].registeredsince,
        lastseenactive : v[0].lastseenactive,
        lastcheck : v[0].lastcheck,
        active : v[0].active,
        endpoints : _(v).filter(e => e.path).map(e => {
          return {
            path : e.path,
            url : `${v[0].location}${e.path}`,
            method: e.method,
            requirements: e.requirements,
            requireslogin : e.requireslogin,
            lastcalled : e.lastcalled,
          };
        }).value(),
      };
    }).value();
}

module.exports.call_service = function(location, path, method, data, req, res, next) {

  const options = {
    url : path,
    baseUrl : location,
    method : method === 'get' && 'get' || 'post',
    headers : {
      'accept' : 'application/json',
      'Content-Type' : 'application/json',
    },
    body : data && JSON.stringify(data) || null,
  };

  request_utils.promisedRequest(options)
    .then(
      res => {
        logger.debug(`Sucessfully called service '${location}'.`);
        res.header('Content-Type', res.response.headers['content-type']);
        res.send(res.body);
        res.end(next);
      },
      err => {
        logger.warn(err);
        err.handleResponse(res);
      }
    );
};

module.exports.get_service_details = function(servicename, extended, callback) {
  if (!extended) {
    return module.exports.get_service_and_endpoints(servicename, callback);
  }

  return module.exports.get_service_and_endpoints(servicename, function (err, service) {
    const location = `${service.location}/swagger`;
    request_utils.promisedRequest(location)
      .then(
        res => {
          service.swagger = JSON.parse(res.body);
          callback(null, service);
        },
        err => {
          logger.warn(err.message);
          callback(err);
        });
  });
};

// execute ping_services function every 10 seconds
(function ping_services_at_intervals(){
    // do some stuff
    module.exports.ping_services();
    setTimeout(ping_services_at_intervals, 10000);
})();
