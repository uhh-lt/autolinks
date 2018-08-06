'use strict';

// imports
const
  Exception = require('../../model/Exception').model,
  auth = require('../../controller/auth'),
  storage = require('../../controller/storage_wrapper'),
  logger = require('../../controller/log')(module);

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
  return res.end('OK\n', next);
  // res.status(500);
  // res.end('not OK\n', next);
};

module.exports.resetuserdb = function(req, res, next) {
  return new Exception('NotImplemented', 'Method is not yet implemented')
    .log(logger.warn)
    .handleResponse(res)
    .end(next);
};


module.exports.resetservicedb = function(req, res, next) {
  return new Exception('NotImplemented', 'Method is not yet implemented')
    .log(logger.warn)
    .handleResponse(res)
    .end(next);
};

module.exports.resetstoragedb = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user) {
    if(user.name !== 'root') {
      res.header('Content-Type', 'text/plain; charset=utf-8');
      res.status(401);
      const msg = `Unauthorized access attempt. Insufficient priviliges for user '${user.name}'.`;
      logger.info(msg);
      return res.end(msg, next);
    }
    return storage.resetData().then(
      _ => res.header('Content-Type', 'text/plain; charset=utf-8').end('OK\n', next),
      err => Exception.fromError(err, 'Resetting storage data failed.').handleResponse(res).end(next)
    );
  });
};