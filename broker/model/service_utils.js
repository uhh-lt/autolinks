'use strict';

// exports
module.exports = {
  ping_service: ping_service,
  ping_services: ping_services
};

// imports
const db = require('./service_db')
  , request = require('request')
  , log = require('./log')(module)
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

  const url = `${location}/ping`;
  request(url, function (error, response, body) {
    const now = new Date().getTime();
    if(error || response.statusCode != 200){
      // if service was active before print a warning, otherwise ignore it
      if(service.active) {
        log.warn(`Cannot reach service ${service.name}`, { service : service , error: error || response }, {});
        log.warn(`Setting service ${service.name} to defunct.`);
      }
      log.debug(`ping service ${service.name} failed.`);
      return db.update_service(service.name, {
        lastcheck: now,
        active: false
      });
    }else{
      // if service was not active before print an info, otherwise ignore it
      if(!service.active) {
        log.debug(`Service ${service.name} is now available.`);
      }
      log.debug(`ping service ${service.name} success.`);
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
    log.warn('Ping services failed.', { error: err }, {});
  }
}

// execute ping_services function every 10 seconds
(function ping_services_at_intervals(){
    // do some stuff
    ping_services();
    setTimeout(ping_services_at_intervals, 10000);
})();
