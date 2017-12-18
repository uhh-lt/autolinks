'use strict';

/**
 * imports
 */
const
  NLP = require('../../controller/nlp_wrapper'),
  logger = require('../../controller/log')(module)
  ;


/**
 * analyze text and create an analysis object
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.analyze = function(req, res, next) {
  const data = req.swagger.params.data.value;
  NLP.analyze(data.data, data['content-type'], data.source , (err, ana) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    if (err) {
      res.status(500);
      return res.end(JSON.stringify({message: err.message, fields: { error: err.message }}), next);
    }
    res.json(ana);
    res.end(next);
  });
};


/**
 *
 * @param req request object
 * @param res response object
 */
module.exports.find_named_entities = function(req, res, next) {
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

};
