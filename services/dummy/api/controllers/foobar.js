'use strict';

const
  ServiceParameter = require('../../../../broker/model/ServiceParameter');

module.exports.foo = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    // get text from service parameter, ignore errors (just return simon)
    const etext = err && 'Simon' || ( serviceParameter.focus.getText(serviceParameter.context.text) || 'Simon' );

    const triples = [
      {
        subject: etext,
        predicate: 'says',
        object: 'bar'
      }
    ];

    // this sends back a JSON response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(triples);
    res.end(next);
  });
};

module.exports.bar = function (req, res, next) {

  const triples = [
    {
      subject: 'Simon',
      predicate: 'says',
      object: 'foo'
    },
    {
      subject: 'Simon',
      predicate: 'says',
      object: 'bar'
    }
  ];

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(triples);
  res.end(next);

};

module.exports.baz = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    // get text from service parameter, ignore errors (just return simon)
    const etext = err && 'Simon' || ( serviceParameter.focus.getText(serviceParameter.context.text) || 'Simon' );

    // this is required
    const username = req.swagger.params.username.value;

    const triples = [{
      subject: [{
        subject: username,
        predicate: 'is same as',
        object: [{
          subject: etext,
          predicate: 'is a',
          object: 'human',
        }]
      }],
      predicate: [{
        subject: 'says',
        predicate: 'is similar to',
        object: 'shout',
      }],
      object: [{
        subject: 'hello',
        predicate: 'is not',
        object: 'goodbye',
      }]
    }];

    // this sends back a JSON response and ends the response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(triples);
    res.end(next);

  });

};
