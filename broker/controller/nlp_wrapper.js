'use strict';

const logger = require('./log')(module)
// , async = require('async')
  ;


module.exports = {
  init : init,
  analyze : analyze,
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
 * @param callbackIter = function(err, entities)
 * @param callbackDone = function(err)
 */
function analyze(document, callbackStart, callbackIter, callbackDone) {
  return explicitNLP.analyze(document, callbackStart, callbackIter, callbackDone);
}

