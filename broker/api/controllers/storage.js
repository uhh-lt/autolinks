'use strict';

const
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
    storage.promisedEditResource(user.id, data.before, data.after).then(
      result => {
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.write(JSON.stringify(result));
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

    storage.promisedSaveFile(user.id, formdata.originalname, formdata.encoding, formdata.mimeType, formdata.size, formdata.buffer, overwrite)
      .then(
        did => res.json({did: did, name: formdata.originalname}).end(next),
        err => Exception.fromError(err).handleResponse(res).end(next)
      );

    // { fieldname: 'data',
    //   originalname: 'lstm_text_generation.py',
    //   encoding: '7bit',
    //   mimetype: 'text/x-python-script',
    //   buffer: <Buffer 27 27 27 45 78 61 6d 70 6c 65 20 73 63 72 69 70 74 20 74 6f 20 67 65 6e 65 72 61 74 65 20 74 65 78 74 20 66 72 6f 6d 20 4e 69 65 74 7a 73 63 68 65 27 ... >,
    //   size: 3332 }
    // console.log(formdata);
    // const fsize = formdata.size;
    // const mimetype = formdata.mimeType;
    // const encoding = formdata.encoding;
    // // TODO: if too large throw error
    // const fname = path.resolve(global.__datadir && path.join(global.__datadir, formdata.originalname) || formdata.originalname);
    // fs.writeFile(fname, formdata.buffer, 'binary', function(err) {
    //   if(err) {
    //     return Exception.fromError(err, `Storing file '${formdata.originalname}' failed.`).handleResponse(res).end(next);
    //   }
    // });
  });
};

module.exports.document_del = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    res.end(next);
  });
};

module.exports.document_get = function(req, res, next) {
  auth.handle_authenticated_request(req, res, function(user){
    res.end(next);
  });
};


