'use strict';

const
  ServiceParameter = require('../../../../broker/model/ServiceParameter').model,
  Triple = require('../../../../broker/model/Triple').model,
  Resource = require('../../../../broker/model/Resource').model;

module.exports.foo = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    // get text from service parameter, ignore errors (just return simon)
    const etext = err && 'Simon' || ( serviceParameter.focus.getText(serviceParameter.context.text) || 'Simon' );

    let resource_triple = new Resource(null, new Triple(new Resource(null, etext), new Resource(null, "says"), new Resource(null, "bar")));

    // this sends back a JSON response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(resource_triple);
    res.end(next);
  });
};

module.exports.bar = function (req, res, next) {

  let resource_triple = new Resource(null, new Triple(new Resource(null, "Simon"), new Resource(null, "says"), new Resource(null, "foo")));
  let resource_triple2 = new Resource(null, new Triple(new Resource(null, "Simon"), new Resource(null, "says"), new Resource(null, "bar")));
  let resource_list = new Resource(null, [resource_triple, resource_triple2]);

  // this sends back a JSON response and ends the response
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.json(resource_list);
  res.end(next);

};

module.exports.baz = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    // get text from service parameter, ignore errors (just return simon)
    const etext = err && 'Simon' || ( serviceParameter.focus.getText(serviceParameter.context.text) || 'Simon' );

    // this is required
    const username = req.swagger.params.username.value;

    let r2 = new Resource(null, new Triple(new Resource(null, "hello"), new Resource(null, "is not"), new Resource(null, "goodbye")));
    let r3 = new Resource(null, new Triple(new Resource(null, "says"), new Resource(null, "is similar to"), new Resource(null, "shout")));
    let r4 = new Resource(null,
        new Triple(new Resource(null, username), new Resource(null, "is same as"),
        new Resource(null, new Triple(new Resource(null, etext), new Resource(null, 'is a'), new Resource(null, 'human')), null, {})));
    let r5 = new Resource(null, new Triple(r4, new Resource().fromString("says"), r2));

    let result = new Resource(null, [r5, r3]);

    // this sends back a JSON response and ends the response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(result);
    res.end(next);

  });

};
