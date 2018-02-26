'use strict';

const
  ServiceParameter = require('../../../../broker/model/ServiceParameter').model,
  Triple = require('../../../../broker/model/Triple').model,
  Resource = require('../../../../broker/model/Resource').model;

module.exports.foo = function(req, res, next) {

  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    // get text from service parameter, ignore errors (just return simon)
    const etext = err && 'Simon' || ( serviceParameter.focus.getText(serviceParameter.context.text) || 'Simon' );

    let resource_triple = new Resource();
    resource_triple.value = new Triple();
    resource_triple.value.subject = new Resource();
    resource_triple.value.predicate = new Resource();
    resource_triple.value.object = new Resource();
    resource_triple.value.subject.value = etext;
    resource_triple.value.predicate.value = "says";
    resource_triple.value.object.value = "bar";

    // this sends back a JSON response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(resource_triple);
    res.end(next);
  });
};

module.exports.bar = function (req, res, next) {

  let resource_triple = new Resource();
  resource_triple.value = new Triple();
  resource_triple.value.subject = new Resource();
  resource_triple.value.predicate = new Resource();
  resource_triple.value.object = new Resource();
  resource_triple.value.subject.value = "Simon";
  resource_triple.value.predicate.value = "says";
  resource_triple.value.object.value = "foo";

  let resource_triple2 = new Resource();
  resource_triple2.value = new Triple();
  resource_triple2.value.subject = new Resource();
  resource_triple2.value.predicate = new Resource();
  resource_triple2.value.object = new Resource();
  resource_triple2.value.subject.value = "Simon";
  resource_triple2.value.predicate.value = "says";
  resource_triple2.value.object.value = "bar";

  let resource_list = new Resource();
  resource_list.value = [
      resource_triple,
      resource_triple2,
  ];


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

    let r1 = new Resource().fromTriple({
        subject: etext,
        predicate: 'is a',
        object: 'human',
    });

    let r2 = new Resource().fromTriple({
        subject: 'hello',
        predicate: 'is not',
        object: 'goodbye',
    });

    let r3 = new Resource().fromTriple({
        subject: 'says',
        predicate: 'is similar to',
        object: 'shout',
    });

    let r4 = new Resource().fromTriple({
        subject: username,
        predicate: 'is same as',
        object: '',
    });
    r4.value.object = r1;

    let r5 = new Resource();
    r5.value = new Triple();
    r5.value.subject = r4;
    r5.value.predicate = new Resource().fromString("says");
    r5.value.object = r2;

    let result = new Resource();
    result.value = [
        r5,
        r3
    ];


    const triples =
      [
        {
          subject: [{
            subject: username,
            predicate: 'is same as',
            object: [{
              subject: etext,
              predicate: 'is a',
              object: 'human',
            }]
          }],
          predicate: 'says',
          object: [{
            subject: 'hello',
            predicate: 'is not',
            object: 'goodbye',
          }]
        },
        {
          subject: 'says',
          predicate: 'is similar to',
          object: 'shout',
        }
      ];

    // this sends back a JSON response and ends the response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(result);
    res.end(next);

  });

};
