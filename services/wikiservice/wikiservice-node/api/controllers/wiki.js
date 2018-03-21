'use strict';

/* imports */
const
  ServiceParameter = require('../../../../../broker/model/ServiceParameter').model,
  Exception = require('../../../../../broker/model/Exception').model,
  es = require('../../controller/es'),
  logger = require('../../../../../broker/controller/log')(module);


module.exports.findArticles = function(req, res, next) {

  return ServiceParameter.fromRequestPromise(req).then(
    serviceParameter => {
      // get the text for the offset
      const text = serviceParameter.focus.getText(serviceParameter.context.text);

      // if we're only asked for the key return it now!
      if(req.swagger.params.getkey.value){
        return res.header('Content-Type', 'text/plain; charset=utf-8').end(text, next);
      }

      // query elastic search
      return es.search(text)
        .then(
          resource => {
            // res.header('Content-Type', 'application/json; charset=utf-8');
            res.json(resource);
            return res.end(next);
          },
          err => {
            const exc = Exception.fromError(err, 'Failed to query elasticsearch.', { serviceParameter : serviceParameter, text : text });
            logger.warn(exc.message, exc);
            return exc.handleResponse(res).end(next);
          }
        );
    },
    err => Exception.handleErrorResponse(err, res).end(next)
  );

};
