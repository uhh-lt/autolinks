'use strict';

const
  auth = require('../../controller/auth'),
  storage = require('../../controller/storage_wrapper'),
  logger = require('../../controller/log')(module)
  ;

module.exports = {
  info: getInfo,
  read: readData,
  write: writeData,
};

function handleError(newmessage, err, res){
  res.header('Content-Type', 'application/json; charset=utf-8');
  const newerr = new Error(newmessage);
  newerr.cause = err;
  logger.warn(newerr.message, err, {});
  res.json(err);
  return res.end();
}


function getInfo(req, res) {

  auth.handle_authenticated_request(req, res, function(user){
    res.header('Content-Type', 'application/json; charset=utf-8');
    storage.info(user.name, function(err, info){
      if(err) {
        return handleError('Could not get info.', err, res);
      }
      res.json(info);
      res.end();
    });
  });

}

function readData(req, res) {

    auth.handle_authenticated_request(req, res, function(user){
      res.header('Content-Type', 'application/json; charset=utf-8');
      const key = req.swagger.params.key.value;
      // console.log(Buffer.from("Hello World").toString('base64'));
      // console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'));
      storage.read(user.name, key, function(err, result){
        if(err) {
          return handleError('Could not read data.', err, res);
        }
        if(result) {
          res.json(result);
        } else {
          res.status(204);
        }
        res.end();
      });
    });

}

function writeData(req, res) {

  auth.handle_authenticated_request(req, res, function(user){
    res.header('Content-Type', 'application/json; charset=utf-8');
    const kvp = req.swagger.params.kvp.value;
    const key = kvp.key;
    const value = kvp.value;
    // console.log(Buffer.from("Hello World").toString('base64'));
    // console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'));
    storage.write(user.name, key, value, function(err){
      if(err) {
        return handleError('Could not write data.', err, res);
      }
      res.end();
    });
  });

}


