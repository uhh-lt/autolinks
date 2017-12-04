'use strict';

const util = require('util');


module.exports = {
  foo : foo,
  bar : bar,
  baz : baz,
};

function foo(req, res, next) {
  // this sends back a JSON response
  res.header('Content-Type', 'application/json; charset=utf-8');

  const entity = req.swagger.params.entity.value;
  if(!entity){
    res.status(500);
    return res.end('No entity provided.', next);
  }

  const etext = entity.text || 'Simon';
  const triple = {
    subject: etext,
    predicate: 'says',
    object: 'foo'
  };

  res.json(triple);
  res.end(next);

}

function bar(req, res, next) {

  const triples = [{
    subject: 'Simon',
    predicate: 'says',
    object: 'bar'
  }];

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(triples);
  res.end(next);

}

function baz(req, res, next) {
  // this sends back a JSON response
  res.header('Content-Type', 'application/json; charset=utf-8');

  // this is required
  const username = req.swagger.params.username.value;
  const entity = req.swagger.params.entity.value;
  if(!entity){
    res.status(500);
    return res.end('No entity provided.', next);
  }

  const triples = [{
    subject: {
      subject: username,
      predicate: 'is',
      object: entity.text || 'Simon',
    },
    predicate: {
      subject: 'says',
      predicate: 'is similar to',
      object: 'shout',
    },
    object: {
      subject: 'hello',
      predicate: 'is not',
      object: 'goodbye',
    }
  }];

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(triples);
  res.end(next);

}
