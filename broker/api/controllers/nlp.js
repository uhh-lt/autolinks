'use strict';

/**
 * imports
 */
const
  auth = require('../../controller/auth'),
  NLP = require('../../controller/nlp_wrapper'),
  nlp_utils = require('../../controller/utils/nlp_utils'),
  Exception = require('../../model/Exception').model,
  DOffset = require('../../model/DOffset').model,
  logger = require('../../controller/log')(module);

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


module.exports.interpret_doffset = function(req, res, next) {

  auth.handle_authenticated_request(req, res, function(user) {

    if (!req.swagger.params.did || !req.swagger.params.did.value) {
      return new Exception('IllegalState', 'Document id is missing!').handleResponse(res).end(next);
    }

    if (!req.swagger.params.focus || !req.swagger.params.focus.value) {
      return new Exception('IllegalState', 'Focus parameter is missing!').handleResponse(res).end(next);
    }

    const did = req.swagger.params.did.value;
    const focus = new DOffset().deepAssign(req.swagger.params.focus.value);

    return nlp_utils.getAnnotationResourcesDoc(user.id, did, focus)
      .then(resource => {
        // this sends back a JSON response
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.json(resource);
        res.end(next);
      });

  });
};


