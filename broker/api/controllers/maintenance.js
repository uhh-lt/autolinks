'use strict';

// imports
// const util = require('util'),
//   request = require('request')
//   ;

module.exports = {
  ping : ping,
};

/**
 *
 * perform self check
 *
 * @param req
 * @param res
 * @param next
 */
function ping(req, res, next) {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.end('OK\n', next);
  // res.status(500);
  // res.end('not OK\n', next);
}
