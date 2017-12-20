'use strict';

/* imports */
const
  ServiceParameter = require('../../../../../broker/model/ServiceParameter'),
  Exception = require('../../../../../broker/model/Exception'),
  logger = require('../../../../../broker/controller/log');


module.exports.findArticles = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    if (err) {
      return Exception.handleErrorResponse(err, res).end(next);
    }

    // get the text for the offset
    const text = serviceParameter.focus.getText(serviceParameter.context.text);

    // query elastic search

    // this sends back a JSON response and ends the response
    // res.header('Content-Type', 'application/json; charset=utf-8');
    // res.json(triples);
    res.end(next);

  });

};
