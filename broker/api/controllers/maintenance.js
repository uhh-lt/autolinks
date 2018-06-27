'use strict';

// imports
const
  Exception = require('../../model/Exception'),
  logger = require('../../controller/log');

/**
 *
 * perform self check
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.ping = function(req, res, next) {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.end('OK\n', next);
  // res.status(500);
  // res.end('not OK\n', next);
};

module.exports.resetuserdb = function(req, res, next) {
  new Exception('NotImplemented', 'Method is not yet implemented')
    .log(logger.warn)
    .handleResponse(res)
    .end(next);
};


module.exports.resetservicedb = function(req, res, next) {
  new Exception('NotImplemented', 'Method is not yet implemented')
    .log(logger.warn)
    .handleResponse(res)
    .end(next);
};

module.exports.resetstoragedb = function(req, res, next) {
  new Exception('NotImplemented', 'Method is not yet implemented')
    .log(logger.warn)
    .handleResponse(res)
    .end(next);
};