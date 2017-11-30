'use strict';

// exports
module.exports = {
  ping_service: ping_service,
  ping_services: ping_services
};

// imports
const
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

// execute ping_services function every 10 seconds
(function ping_services_at_intervals(){
    // do some stuff
    ping_services();
    setTimeout(ping_services_at_intervals, 10000);
})();
