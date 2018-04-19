'use strict';

/**
 * imports
 */
const
  auth = require('../../controller/auth'),
  NLP = require('../../controller/nlp_wrapper'),
  nlp_utils = require('../../controller/utils/npl_utils'),
  Exception = require('../../model/Exception').model,
  Resource = require('../../model/Resource').model,
  ServiceParameter = require('../../model/ServiceParameter').model,
  DOffset = require('../../model/DOffset').model,
  logger = require('../../controller/log')(module)
  ;


/**
 * analyze text and create an analysis object
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.analyze = function(req, res, next) {
  if(!req.swagger.params.data || !req.swagger.params.data.value){
    return new Exception('IllegalState', 'Data parameter is missing!').handleResponse(res).end(next);
  }
  const data = req.swagger.params.data.value;
  return NLP.analyze(data.data, data['content-type'], data.source)
    .then(
      ana => res.json(ana).end(next),
      err => Exception.fromError(err, 'Error while processing data.', { data : data } ).handleResponse(res).end(next)
    );
};


module.exports.analyze_doc = function(req, res, next) {

  auth.handle_authenticated_request(req, res, function(user) {

    if (!req.swagger.params.did || !req.swagger.params.did.value) {
      return new Exception('IllegalState', 'Document id is missing!').handleResponse(res).end(next);
    }

    const did = req.swagger.params.did.value;

    const refresh =  req.swagger.params.refresh && req.swagger.params.refresh.value;

    return NLP.analyzeDocument(user.id, did, refresh)
      .then(
        ana => res.json(ana).end(next),
        err => Exception.fromError(err, `Error while processing document ${did}.`).handleResponse(res).end(next)
      );

  });

};



module.exports.interpret = function(req, res, next) {

  auth.handle_authenticated_request(req, res, function(user) {
    ServiceParameter.fromRequestPromise(req)
      .then(serviceParameter => {
        const focus = serviceParameter.focus;
        const ana = serviceParameter.context.text;
        return nlp_utils.getAnnotationResources(user.id, ana, focus)
          .then(resource => {
            // this sends back a JSON response
            res.header('Content-Type', 'application/json; charset=utf-8');
            res.json(resource);
            res.end(next);
          });
      })
      .catch(err => Exception.fromError(err).handleResponse(res).end(next));
  });
};


module.exports.interpret_doffset = function(req, res, next) {

  ServiceParameter.fromRequestPromise(req)
    .then(serviceParameter => {
      const focus = serviceParameter.focus;
      const ana = serviceParameter.context.text;

      // this sends back a JSON response
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.json(resource);
      res.end(next);

    })
    .catch(err => Exception.fromError(err).handleResponse(res).end(next));
};


