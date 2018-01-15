'use strict';

const
  auth = require('../../controller/auth'),
  storage = require('../../controller/storage_wrapper'),
  Exception = require('../../model/Exception'),
  logger = require('../../controller/log')(module);

module.exports.info = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    res.header('Content-Type', 'application/json; charset=utf-8');
    storage.info(user.name, function(err, info){
      if(err) {
        return Exception.fromError(err, 'Could not get info.').log(logger.warn).handleResponse(res).end(next);
      }
      res.json(info);
      res.end(next);
    });
  });
};

module.exports.read = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    res.header('Content-Type', 'application/json; charset=utf-8');
    const key = req.swagger.params.key.value;
    // console.log(Buffer.from("Hello World").toString('base64'));
    // console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'));
    storage.read(user.name, key, function(err, result){
      if(err) {
        return Exception.fromError(err, 'Could not read data.').log(logger.warn).handleResponse(res).end(next);
      }
      if(result) {
        res.json(result);
      } else {
        res.status(204);
      }
      res.end(next);
    });
  });
};

module.exports.write = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    res.header('Content-Type', 'application/json; charset=utf-8');
    const kvp = req.swagger.params.kvp.value;
    const key = kvp.key;
    const value = kvp.value;
    // console.log(Buffer.from("Hello World").toString('base64'));
    // console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'));
    storage.write(user.name, key, value, function(err){
      if(err) {
        return Exception.fromError(err, 'Could not write data.').log(logger.warn).handleResponse(res).end(next);
      }
      res.end(next);
    });
  });
};


