'use strict';

const
  NLP = require('../../controller/nlp_wrapper'),
  logger = require('../../controller/log')(module)
  ;

module.exports = {
  find_named_entities: findNamedEntities,
  analyze: analyze,
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
function analyze(req, res, next) {
  const ana = req.swagger.params.analysis.value;
  NLP.analyze(ana, (err, newana) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    if (err) {
      res.status(500);
      return res.end(JSON.stringify({message: err.message, fields: { error: err.message }}), next);
    }

    res.end('NOT YET IMPLEMENTED',next);
  });
}


/**
 *
 * @param req request object
 * @param res response object
 */
function findNamedEntities(req, res, next) {
  // get the analysis parameter from swagger
  // TODO: check for existence
  const ana = req.swagger.params.analysis.value;

  res.header('Content-Type', 'application/json; charset=utf-8');

  let written_at_least_one = false;

  NLP.findNamedEntities(
    /* current analysis */ana,
    /* callbackStart */function (err) {
      if (err) {
        logger.warn(`Analysis failed for. Source: '${ana.source}'.`, ana.source, err, {});
        res.end(JSON.stringify({message: err.message, fields: {analysis: ana.source, error: err}}));
      } else {
        res.write('[');
      }
    },
    /* callbackIter */function (err, entity) {
      if (err) {
        logger.warn(`NER returned errors while producing entities. Source: '${ana.source}'.`, ana.source, err, {});
        res.end(JSON.stringify({message: err.message, fields: {analyis: ana.source, error: err}}));
      } else {
        if(written_at_least_one) {
          res.write(',');
        }
        res.write(JSON.stringify(entity));
        written_at_least_one = true;
      }
    },
    /* callbackDone */ function (err) {
      if (err) {
        logger.warn(`Analysis returned errors after processing entities: '${ana.source}'.`, ana.source, err, {});
        res.end(JSON.stringify({message: err.message, fields: {analysis: ana.source, error: err}}), next);
      } else {
        res.end(']', next);
      }
    }
  );

}
