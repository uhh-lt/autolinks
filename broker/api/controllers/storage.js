'use strict';

const logger = require('../../controller/log')(module)
  ;

module.exports = {
  info: info,
  read: readData,
  write: writeData,
};


function info(req, res) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  if (err) {
    res.status(500);
    return res.end(JSON.stringify({message: err.message, fields: {error: err}}));
  }
  res.end(JSON.stringify(user));
}

function readData(req, res) {

  // console.log(Buffer.from("Hello World").toString('base64'));
  // console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'));

  const key = req.swagger.params.key.value;

  res.header('Content-Type', 'application/json; charset=utf-8');
  if (err) {
    res.status(500);
    return res.end(JSON.stringify({message: err.message, fields: {error: err}}));
  }


  res.end(JSON.stringify(user));
}

function writeData(req, res) {

  // console.log(Buffer.from("Hello World").toString('base64'));
  // console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii'));

  const kvp = req.swagger.params.kvp.value;
  const key = kvp.key;
  const value = kvp.value;

  res.header('Content-Type', 'application/json; charset=utf-8');
  if (err) {
    res.status(500);
    return res.end(JSON.stringify({message: err.message, fields: {error: err}}));
  }


  res.end(JSON.stringify(user));
}


