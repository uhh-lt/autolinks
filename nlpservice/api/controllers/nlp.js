'use strict';

const logger = require('../../controller/log')(module)
  , NLP = require('../../controller/NlpWrapper')
  ;

module.exports = {
  find_named_entites: findNamedEntities
};


/**
 *
 * @param req request object
 * @param res response object
 */
function find_named_entities(req, res) {
  // get the document parameter from swagger
  const doc = req.swagger.params.document.value;

  res.header('Content-Type', 'application/json; charset=utf-8');

  NLP.analyze({
      document: doc,
      callbackStart: function (err) {
        if (err) {
          logger.warn(`Analysis failed for document '${doc.source}'.`, doc.source, err, {});
          res.end(JSON.stringify({message: err.message, fields: {document: doc.source, error: err}}));
        } else {
          res.write('[');
        }
      },
      callbackIter: function (err, entity) {
        if (err) {
          logger.warn(`NER returned errors while producing entities for document '${doc.source}'.`, doc.source, err, {});
          res.end(JSON.stringify({message: err.message, fields: {document: doc.source, error: err}}));
        } else {
          res.write(JSON.stringify(entity));
        }
      },
      callbackDone: function (err) {
        if (err) {
          logger.warn(`Analysis returned errors after processing entities document '${doc.source}'.`, doc.source, err, {});
          res.end(JSON.stringify({message: err.message, fields: {document: doc.source, error: err}}));
        } else {
          res.end(']');
        }
      }
    }
  );



}
