'use strict';

/**
 * imports
 */
const
  NLP = require('../../controller/nlp_wrapper'),
  Exception = require('../../model/Exception'),
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
  try {
    NLP.analyze(data.data, data['content-type'], data.source , (err, ana) => {
      if (err) {
        return Exception.fromError(err, 'Error while processing data.', { data : data } ).handleResponse(res).end(next);
      }
      res.json(ana).end(next);
    });
  }catch(err){
    return Exception.fromError(err, 'Error while processing data.', { data : data } ).handleResponse(res).end(next);
  }
};


/**
 *
 * @param req request object
 * @param res response object
 */
module.exports.find_named_entities = function(req, res, next) {
  // get the analysis parameter from swagger
  // TODO: check for existence
  const ana = req.swagger.params.data.value;

  let started_writing = false;
  let written_at_least_one = false;

  res.header('Content-Type', 'application/json; charset=utf-8');

  try {
    NLP.findNamedEntities(
      /* current analysis */ana,
      /* callbackStart */ (err) => {
        res.write('[');
        if (err) {
          const ex = Exception.fromError(err, `Analysis failed for. Source: '${ana.source}'.`, {analysis: ana});
          logger.warn(ex.message, ex);
          ex.handleResponse(res);
        }
        started_writing = true;
      },
      /* callbackIter */ (err, entity) => {
        if (err) {
          const ex = Exception.fromError(err, `NER returned errors while producing entities. Source: '${ana.source}'.`, {analysis: ana});
          logger.warn(ex.message, ex);
          ex.handleResponse(res);
        } else {
          if (written_at_least_one) {
            res.write(',');
          }
          res.write(JSON.stringify(entity));
          written_at_least_one = true;
        }
      },
      /* callbackDone */ (err) => {
        if (err) {
          const ex = Exception.fromError(err, `Analysis returned errors after processing entities: '${ana.source}'.`, {analysis: ana});
          logger.warn(ex.message, ex);
          ex.handleResponse(res);
        }
        res.end(']', next);
      }
    );
  } catch(err) {
    Exception.fromError(err, 'Error while processing data.', {analysis: ana}).handleResponse(res);
    if(started_writing){
      res.write(']');
    }
    res.end(next);

  }

};
