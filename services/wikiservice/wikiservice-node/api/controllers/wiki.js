'use strict';

/* imports */
const
  ServiceParameter = require('../../../../../broker/model/ServiceParameter').model,
  Exception = require('../../../../../broker/model/Exception').model,
  es = require('../../controller/es'),
  logger = require('../../../../../broker/controller/log')(module);


module.exports.findArticles = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    if (err) {
      return Exception.handleErrorResponse(err, res).end(next);
    }

    // get the text for the offset
    const text = serviceParameter.focus.getText(serviceParameter.context.text);

    // query elastic search
    res.header('Content-Type', 'application/json; charset=utf-8');
    let writtenAtLeastOneResult = false;
    es.search(
      text,
      function(err, result){
        if (writtenAtLeastOneResult) {
          res.write(',');
        } else {
          res.write('[');
        }
        if (err) {
          const exc = Exception.fromError(err, 'Failed to query elasticsearch.', { serviceParameter : serviceParameter, text : text });
          logger.warn(exc.message, exc);
          return exc.handleResponse(res).end(next);
        }

        res.write(JSON.stringify(result));

        writtenAtLeastOneResult = true;

      },
      function(err){
        if(err){
          const exc = Exception.fromError(err, 'Failed to finalize querying elasticsearch.', { serviceParameter : serviceParameter, text : text });
          logger.warn(exc.message, exc);
          exc.handleResponse(res);
        }
        res.end(']', next);
      }
    );
  });

};
