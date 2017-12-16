'use strict';

// imports
const
  _ = require('lodash'),
  db = require('../service_db'),
  request = require('request'),
  logger = require('../log')(module)
;



module.exports = {
  ping_service : ping_service,
  get_services_and_endpoints : get_services_and_endpoints,
  get_service_and_endpoints : get_service_and_endpoints,
  get_service_details : get_service_details,
  call_service : call_service,
};



// ping a service
function ping_service(service, callback) {

  let location = service.location;

  if(!location){
    return db.get_service(service.name, service.version, (err, row) => {
      if(err){
        return callback(err);
      }
      if(!row.location){
        return callback(new Error(`No URL location for service '${service.name}:${service.version}' found.`));

      }
      ping_service(row, callback);
    });
  }

  const url = `${location}/ping`;
  request(url, function (error, response, body) {
    const now = new Date().getTime();
    if(error || response.statusCode !== 200){
      // if service was active before print a warning, otherwise ignore it
      if(service.active) {
        logger.warn(`Cannot reach service '${service.name}:${service.version}'`, { service : service , error: error || response }, {});
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
            if(error){
              error.message = error.message + ' AND ' + err2.message;
            } else {
              error  = err2
            }
          }
          callback(error)
        });
    }

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

  });
}

// ping all registered services
function ping_services(){
  db.get_services(
    function(err, service){
      if(err){
        /* ignore */
        return;
      }
      ping_service(service, function(err){
        /* ignore */
        return;
      })
    },
    function(err, numrows) {
      /* ignore */
    });
}

// get the services + endpoints
function get_services_and_endpoints(callback_service, callback_done){
  db.get_joined_services_and_endpoints(function(err, rows){
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
}

// get a service and its endpoints
function get_service_and_endpoints(servicename, callback) {
  db.get_joined_service_and_endpoints(servicename, function(err, rows) {
    if(err) {
      const newerr = new Error('Could not query service-endpoint joins.');
      newerr.cause = err;
      logger.warn(newerr.message, err);
      return callback(newerr, null);
    }
    const services = remap_joined_service_endpoint_rows(rows);
    if(services.length < 1){
      // TODO: no service found
    }
    if(services.length > 1){
      // TODO: too many services found, why??
    }
    callback(null, services[0]);
  });
}


/**
 *
 * @param rows
 */
function remap_joined_service_endpoint_rows(rows) {
  return _(rows).groupBy(r => r.name) // group by service name
    .map((v,k) => { // reformat row
      return {
        name : k,
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

function call_service(location, path, method, data, req, res, next) {

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
  request(options, function (error, response, body) {
    if(error || response.statusCode !== 200){
      const msg = `Requesting service '${location}' failed.`;
      logger.warn(msg);
      logger.error(error || response);
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.status(500);
      res.send(JSON.stringify({ message: msg, fields: error.message || response }));
      return res.end(next);
    }
    logger.debug(`Sucessfully called service '${location}'.`);
    res.header('Content-Type', response.headers['content-type']);
    res.send(body);
    res.end(next);
  });

}


function get_service_details(servicename, extended, callback) {
  if (!extended) {
    return get_service_and_endpoints(servicename, callback);
  }

  return get_service_and_endpoints(servicename, function (err, service) {
    const location = `${service.location}/swagger`;
    request(location, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        const msg = `Requesting service details from '${location}' failed.`;
        logger.warn(msg);
        logger.error(error || response);
        const newerr = new Error(msg);
        newerr.cause = err;
        return callback(newerr, null);
      }
      service.swagger = JSON.parse(body);
      callback(null, service);
    });
  });
}

// execute ping_services function every 10 seconds
(function ping_services_at_intervals(){
    // do some stuff
    ping_services();
    setTimeout(ping_services_at_intervals, 10000);
})();
