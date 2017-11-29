'use strict';

const util = require('util'),
  request = require('request')
  ;

module.exports = {
  ping : ping,
  register_at_broker : registerAtBroker,
};



function ping(req, res, next) {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.end('OK\n', next);
}


function registerAtBroker(req, res, next) {

  if(!req.swagger.params.data || !req.swagger.params.data.value){
    const msg = 'No data provided.';
    console.warn(msg);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(500);
    res.json({ message: msg });
    return res.end(next);
  }
  const data = req.swagger.params.data.value;
  const location = data.location;
  if(!location){
    const msg = 'No location provided.';
    console.warn(msg);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(500);
    res.json({ message: msg });
    return res.end(next);
  }

  const options = {
    url : '/service/registerService',
    baseUrl : location,
    method : 'POST',
    headers : {
      'accept' : 'application/json',
      'Content-Type' : 'application/json',
    },
    body : global.serviceDefinition,
  };
  request(options, function (error, response, body) {
    if(error || response.statusCode !== 200){
      const msg = `Registering self at '${location}' failed.`;
      console.warn(msg);
      console.error(error || response);
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.status(500);
      res.send(JSON.stringify({ message: msg, fields: error.message || response }));
      return res.end(next);
    }
    // response.statuscode === 200
    console.debuglog(`Sucessfully registered service at '${location}'.`);
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.end('OK\n', next);
  });

}
