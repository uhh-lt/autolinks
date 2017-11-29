'use strict';

const util = require('util');


module.exports = {
  foo : foo,
  bar : bar,
  baz : baz,
};

function foo(req, res, next) {

  const entity = req.swagger.params.entity.value;
  if(!entity){
    return res.end('No entity provided.', next);
  }

  const triple = {
    subject: entity.text,
    predicate: 'says',
    object: 'hello'
  };

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(triple);
  res.end(next);

}

function bar(req, res, next) {

  const triple = {
    subject: 'world',
    predicate: 'says',
    object: 'hello'
  };

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(triple);
  res.end(next);

}

function baz(req, res, next) {

  const username = req.swagger.params.username.value;
  const entity = req.swagger.params.entity.value;
  if(!entity){
    return res.end('No entity provided.', next);
  }

  const triple = {
    subject: entity.text,
    predicate: 'says',
    object: username
  };

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(triple);
  res.end(next);

}
