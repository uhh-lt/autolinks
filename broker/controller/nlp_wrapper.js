'use strict';

/**
 * imports
 */
const logger = require('./log')(module);

/**
 * exports
 */
module.exports = {
  init : init,
  analyze : analyze,
  findNamedEntities : findNamedEntities,
}

const explicitNLP = (() => {
  switch (process.env.NER) {
    case 'corenlp':
      logger.info('Using CoreNLP');
      return require('./nlp-components/CoreNLP')({

      });
    case 'germaner':
      logger.info('Using GermaNER');
      return require('./nlp-components/GermaNER')({

      });
    case 'stupid':
    default:
      logger.info('Using StupidNER');
      return require('./nlp-components/StupidNER');
  }
})();

/**
 *
 * @param callback
 */
function init(callback) {
  return explicitNLP.init(callback);
}

/**
 *
 * @param document
 * @param callbackIter = function(err, analysis)
 */
function analyze(document, callback) {
  return explicitNLP.analyze(document, callback);
}

/**
 *
 * @param analysis
 * @param callbackStart = function(err)
 * @param callbackIter = function(err, entities)
 * @param callbackDone = function(err)
 */
function findNamedEntities(analysis, callbackStart, callbackIter, callbackDone) {
  return explicitNLP.analyze(analysis, callbackStart, callbackIter, callbackDone);
}


