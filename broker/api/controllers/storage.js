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
    new Exception('NOT IMPLEMENTED', 'not yet implemented').handleResponse(res).end(next);
  });

};

module.exports.write = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    new Exception('NOT IMPLEMENTED', 'not yet implemented').handleResponse(res).end(next);
  });
};

module.exports.editresource = function(req, res, next) {
  const data = req.swagger.params.data.value;
  if(!data) {
    return Exception.fromError(null, 'No data object provided.', {data: data}).handleResponse(res).end(next);
  }
  auth.handle_authenticated_request(req, res, function(user) {
    storage.promisedEditResource(data.before, data.after, user).then(
      result => {
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.write(JSON.stringify(result));
        res.end(next);
      },
      err => Exception.fromError(err, 'Editing resource failed.').handleResponse(res).end(next)
    );
  });
};


