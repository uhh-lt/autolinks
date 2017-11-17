'use strict';

// exports
module.exports = {
  ping_service: ping_service,
  ping_services: ping_services
};

// imports
const db = require('./service_db')
  , request = require('request')
	;

// ping a service
function ping_service(service) {

  let location = service.location;
  if(!location){
    db.get_service(service.name, (service) => {
      if(service.location){
        ping_service(service);
      }else{
        console.log(`No location for service ${service.name} found.`);
      }
    });
    return;
  }

  const url = `${location}/ping`;
  request(url, function (error, response, body) {
    console.log(`ping service ${service.name}`);
    if(error || response.statusCode != 200){
      // on error
      console.log(`Error: ${error}`);
      console.log(`Response: ${response}`);
      console.log(`Setting service ${service.name} to defunct.`);
      db.update_service(service.name, {
        active: false
      });
    }else{
      // on success
      db.update_service(service.name, {
        lastseenactive: new Date().getTime(),
        active: true
      });
    }
  });
}

// ping all registered services
function ping_services(){
  db.get_services(ping_service, () => {});
}

// execute ping_services function every 10 seconds
(function ping_services_at_intervals(){
    // do some stuff
    ping_services();
    setTimeout(ping_services_at_intervals, 10000);
})();
