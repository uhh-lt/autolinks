'use strict';

const
  wd = require('../../controller/Wikidata'),
  log = require('../../../../broker/controller/log')(module),
  ServiceParameter = require('../../../../broker/model/ServiceParameter').model,
  Exception = require('../../../../broker/model/Exception').model;

module.exports.wikidata = function(req, res, next) {

  return ServiceParameter.fromRequestPromise(req).then(
    serviceParameter => {
      // get the text for the offset
      const text = serviceParameter.focus.getText(serviceParameter.context.text);

      // if we're only asked for the key return it now!
      if(req.swagger.params.getkey.value){
        return res.header('Content-Type', 'text/plain; charset=utf-8').end(text, next);
      }

      // query wikidata
      return wd.search(text)
        .then(wd.query_sparql)
        .then(
          resource => res.json(resource).end(next),
          err => {
            const exc = Exception.fromError(err, 'Failed to query wikidata.', { serviceParameter : serviceParameter, text : text });
            log.warn(exc.message, exc);
            return exc.handleResponse(res).end(next);
          }
        );
    },
    err => Exception.handleErrorResponse(err, res).end(next)
  );
};

