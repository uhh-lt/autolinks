'use strict';

// exports
module.exports = {
  ping_service: ping_service,
  ping_services: ping_services,
  get_services_and_endpoints : get_services_and_endpoints,
  call_service : call_service,
};

// imports
const
  _ = require('lodash'),
  db = require('./service_db'),
  request = require('request'),
  logger = require('./log')(module)
	;

// ping a service
function ping_service(service) {

  let location = service.location;

  if(!location){
    db.get_service(service.name, (service) => {
      if(service.location){
        return ping_service(service);
      } else {
        return new Error(`No URL location for service ${service.name} found.`);
      }
    });
  }

  const url = `${location}/service/ping`;
  request(url, function (error, response, body) {
    const now = new Date().getTime();
    if(error || response.statusCode !== 200){
      // if service was active before print a warning, otherwise ignore it
      if(service.active) {
        logger.warn(`Cannot reach service ${service.name}`, { service : service , error: error || response }, {});
        logger.warn(`Setting service ${service.name} to defunct.`);
      }
      logger.warn(`ping service '${service.name}' failed.`);
      return db.update_service(service.name, {
        lastcheck: now,
        active: false
      });
    }else{
      logger.debug(`ping service '${service.name}' success.`);
      // if service was not active before print an info, otherwise ignore it
      if(!service.active) {
        logger.info(`Service '${service.name}' is now available.`);
      }
      return db.update_service(service.name, {
        lastseenactive: now,
        lastcheck: now,
        active: true
      });
    }
  });
}

// ping all registered services
function ping_services(){
  const err = db.get_services(ping_service, () => {});
  if(err){
    logger.warn('Ping services failed.', { error: err }, {});
  }
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
    _(rows)
      .groupBy(r => r.name) // group by service name
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
              requireslogin : e.requireslogin,
              lastcalled : e.lastcalled,
            };
          }).value(),
        };
      })
      .forEach(s => callback_service(s));
    callback_done();
  });
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

// execute ping_services function every 10 seconds
(function ping_services_at_intervals(){
    // do some stuff
    ping_services();
    setTimeout(ping_services_at_intervals, 10000);
})();
