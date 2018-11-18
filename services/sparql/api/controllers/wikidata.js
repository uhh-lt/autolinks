'use strict';

const
  wd = require('../../controller/Wikidata'),
  log = require('../../../../broker/controller/log')(module),
  ServiceParameter = require('../../../../broker/model/ServiceParameter').model,
  Exception = require('../../../../broker/model/Exception').model;


function run(req, res, next, textpromise) {
  return ServiceParameter.fromRequestPromise(req).then(
    serviceParameter => {
      // get the text for the offset
      const text = serviceParameter.focus.getText(serviceParameter.context.text);

      // if we're only asked for the key return it now!
      if(req.swagger.params.getkey.value){
        return res.header('Content-Type', 'text/plain; charset=utf-8').end(text, next);
      }

      // run promise
      return textpromise(text)
        .then(
          resource => res.json(resource).end(next),
          err => {
            const exc = Exception.fromError(err, 'Failed to query wikidata.', { serviceParameter : serviceParameter, text : text });
            log.warn(exc.message, exc);
            return exc.handleResponse(res).end(next);
          }
        );
    },
    err => Exception.handleErrorResponse(err, res).end(next)
  );
}

module.exports.wikidata = function(req, res, next) {
  return run(req, res, next, (text) => wd.search(text).then(wd.query_sparql).then(r => {r.metadata.label = `Wikidata '${text}'.`; return r; }));
};

module.exports.wikidataObjects = function(req, res, next) {
  return run(req, res, next, (text) => wd.search(text).then(wd.objects).then(r => {r.metadata.label = `Wikidata objects '${text}'.`; return r; }));
};

module.exports.wikidataSubjects = function(req, res, next) {
  return run(req, res, next, (text) => wd.search(text).then(wd.subjects).then(r => {r.metadata.label = `Wikidata subjects '${text}'.`; return r; }));
};

module.exports.wikidataLimit = function(req, res, next) {
  return run(req, res, next, (text) => wd.search(text, 1).then(h => wd.query_sparql(h)).then(r => {r.metadata.label = `Wikidata '${text}' (limit 1)`; return r; }));
};

module.exports.wikidataObjectsLimit10 = function(req, res, next) {
  return run(req, res, next, (text) => wd.search(text, 1).then(h => wd.objects(h, 10)).then(r => {r.metadata.label = `Wikidata objects '${text}' (limit 1|10)`; return r; }));
};

module.exports.wikidataSubjectsLimit10 = function(req, res, next) {
  return run(req, res, next, (text) => wd.search(text, 1).then(h => wd.subjects(h, 10)).then(r => {r.metadata.label = `Wikidata subjects '${text}' (limit 1|10)`; return r; }));
};


