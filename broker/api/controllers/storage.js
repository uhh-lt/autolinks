'use strict';

const
  fs = require('fs'),
  auth = require('../../controller/auth'),
  storage = require('../../controller/storage_wrapper'),
  Exception = require('../../model/Exception').model,
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
  new Exception('NOT IMPLEMENTED', 'not yet implemented').handleResponse(res).end(next);
};

module.exports.write = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user) {
    new Exception('NOT IMPLEMENTED', 'not yet implemented').handleResponse(res).end(next);
  });
};

module.exports.editresource = function(req, res, next) {
  const data = req.swagger.params.data.value;
  if(!data) {
    return Exception.fromError(null, 'No data object provided.', {data: data}).handleResponse(res).end(next);
  }
  auth.handle_authenticated_request(req, res, function(user) {
    storage.promisedEditResource(user.id, data.before, data.after).then(
      result => {
        res.header('Content-Type', 'text/plain; charset=utf-8').write(JSON.stringify(result));
        res.end(next);
      },
      err => Exception.fromError(err, 'Editing resource failed.').handleResponse(res).end(next)
    );
  });
};

module.exports.document_add = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){

    if(!req.swagger.params.data.value){
      return new Exception('IllegalState', 'Data missing!').handleResponse(res).end(next);
    }

    const formdata = req.swagger.params.data.value;
    const overwrite =  req.swagger.params.overwrite && req.swagger.params.overwrite.value;

    storage.promisedSaveFile(user.id, formdata.originalname, formdata.encoding, formdata.mimetype, formdata.size, formdata.buffer, overwrite)
      .then(
        did => res.json({did: did, name: formdata.originalname}).end(next),
        err => Exception.fromError(err).handleResponse(res).end(next)
      );

  });
};

module.exports.documents_list = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    const detailed =  req.swagger.params.detailed && req.swagger.params.detailed.value;
    storage.promisedListFiles(user.id, detailed)
      .then(
        dids => res.json(dids).end(next),
        err => Exception.fromError(err).handleResponse(res).end(next)
      );
  });
};

module.exports.document_del = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){

    if(!req.swagger.params.did.value){
      return new Exception('IllegalState', 'Document id missing!').handleResponse(res).end(next);
    }

    const did = req.swagger.params.did.value;

    storage.promisedDeleteFile(user.id, did)
      .then(
        _ => {
          res.header('Content-Type', 'text/plain; charset=utf-8');
          res.end('OK\n', next);
        },
        err => Exception.fromError(err).handleResponse(res).end(next)
      );

  });
};

module.exports.document_get = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    if(!req.swagger.params.did.value){
      return new Exception('IllegalState', 'Document id missing!').handleResponse(res).end(next);
    }
    if(!req.swagger.params.target.value){
      return new Exception('IllegalState', 'Target parameter is missing!').handleResponse(res).end(next);
    }

    const did = req.swagger.params.did.value;
    const target = req.swagger.params.target.value;

    if(target !== 'content'){
      return storage.promisedGetFile(user.id, did, target)
        .then(result => res.json(result).end(next));
    }
    // else
    return storage.promisedGetFile(user.id, did, 'info')
      .then(docinfo => storage.promisedGetFile(user.id, did, 'content')
        .then(doccontent => {
          res.setHeader('Content-disposition', `attachment; filename=${docinfo.filename}`);
          res.setHeader('Content-type', docinfo.mimetype);
          res.write(doccontent);
          res.end(next);
        }));
  });
};

module.exports.document_analysis_update = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){

    if(!req.swagger.params.did.value){
      return new Exception('IllegalState', 'Document id missing!').handleResponse(res).end(next);
    }

    const did = req.swagger.params.did.value;
    const ana = req.swagger.params.analysis && req.swagger.params.analysis.value;

    storage.updateDocumentAnalysis(user.id, did, ana)
      .then(
        _ => {
          res.header('Content-Type', 'text/plain; charset=utf-8');
          res.end('OK\n', next);
        },
        err => Exception.fromError(err).handleResponse(res).end(next)
      );

  });
};




