'use strict';

const
  Exception = require('../../../../../broker/model/Exception'),
  esclient = require('../../controller/esclient'),
  logger = require('../../../../../broker/controller/log'),
  request = require('request');

/**
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.ping = function (req, res, next) {

  esclient.ping(function(err){
    if(err) {
      return Exception
        .fromError(err, 'Elasticsearch is not available.')
        .handleResponse(res)
        .end(next);
    }
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.end('OK\n', next);
  });

};

module.exports.register_at_broker = function(req, res, next) {

  if(!req.swagger.params.data || !req.swagger.params.data.value){
    return new Exception('No data provided.').handleResponse(res).end(next);
  }
  const data = req.swagger.params.data.value;
  const location = data.location;
  if(!location){
    return new Exception('No \'location\' parameter provided.').handleResponse(res).end(next);
  }
  const options = {
    url : '/service/registerService',
    baseUrl : location,
    method : 'POST',
    headers : {
      'accept' : 'application/json',
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(global.serviceDefinition),
  };
  callBroker(options, res, next);

};

module.exports.register_at_system_broker = function (req, res, next) {

  const location = process.env.BROKER_URL || 'http://broker:10010';
  logger.info(`Registering self at broker at '${location}'.`);
  const options = {
    url : '/service/registerService',
    baseUrl : location,
    method : 'POST',
    headers : {
      'accept' : 'application/json',
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(global.serviceDefinition),
  };

  callBroker(options, res, next);

};

function callBroker(options, res, next){

  request(options, function (error, response, body) {
    if(error || response.statusCode !== 200){
      const ex =  Exception.fromError(error, `Registering self at '${options.baseUrl}' failed.`, { response: response });
      logger.warn(ex.message, ex);
      return ex.handleResponse(res).end(next);
    }
    logger.debug(`Sucessfully registered service at '${options.baseUrl}'.`);
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.end('OK\n', next);
  });

}


