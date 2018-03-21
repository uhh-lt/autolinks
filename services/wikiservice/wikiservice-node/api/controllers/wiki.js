'use strict';

/* imports */
const
  ServiceParameter = require('../../../../../broker/model/ServiceParameter').model,
  Exception = require('../../../../../broker/model/Exception').model,
  es = require('../../controller/es'),
  logger = require('../../../../../broker/controller/log')(module);


module.exports.findArticles = function(req, res, next) {

  return ServiceParameter.fromRequest(req).then(
    serviceParameter => {
      // get the text for the offset
      const text = serviceParameter.focus.getText(serviceParameter.context.text);

      // if we're only asked for the key return it now!
      if(req.swagger.params.getkey.value){
        return res.header('Content-Type', 'text/plain; charset=utf-8').end(text, next);
      }

      // query elastic search
      res.header('Content-Type', 'application/json; charset=utf-8');

      // es.search(
      //   text,
        // function(err, result){
        //   if (err) {
        //     const exc = Exception.fromError(err, 'Failed to query elasticsearch.', { serviceParameter : serviceParameter, text : text });
        //     logger.warn(exc.message, exc);
        //     return exc.handleResponse(res).end(next);
        //   }
        //
        //   res.json(result);
        //
        //   writtenAtLeastOneResult = true;
        //
        // },
        // function(err){
        //   if(err){
        //     const exc = Exception.fromError(err, 'Failed to finalize querying elasticsearch.', { serviceParameter : serviceParameter, text : text });
        //     logger.warn(exc.message, exc);
        //     exc.handleResponse(res);
        //   }
        //   res.end(next);
        // }
      // );
      res.end(next);
  },
  err => Exception.handleErrorResponse(err, res).end(next)
  );

};
