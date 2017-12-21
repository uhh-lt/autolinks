'use strict';

/* imports */
const
  ServiceParameter = require('../../../../../broker/model/ServiceParameter'),
  Exception = require('../../../../../broker/model/Exception'),
  es = require('../../controller/es'),
  logger = require('../../../../../broker/controller/log');


module.exports.findArticles = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    if (err) {
      return Exception.handleErrorResponse(err, res).end(next);
    }

    // get the text for the offset
    const text = serviceParameter.focus.getText(serviceParameter.context.text);

    // query elastic search
    es.search(
      text,
      function(err, result){
        if (err) {
          const exc = Exception.fromError(err, 'Failed to query elasticsearch.', { serviceParameter : serviceParameter, text : text });
          logger.warn(exc.message, exc);
          return exc.handleResponse(res);
        }
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.write(JSON.stringify(es.transformSearchResults(text, result)));
        // res.json(es.transformSearchResults(text, result));
      },
      function(err){
        if(err){
          const exc = Exception.fromError(err, 'Failed to finalize querying elasticsearch.', { serviceParameter : serviceParameter, text : text });
          logger.warn(exc.message, exc);
          exc.handleResponse(res);
        }
        res.end(next);
      }
    );
  });

};
