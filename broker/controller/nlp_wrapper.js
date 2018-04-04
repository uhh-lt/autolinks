'use strict';

/**
 * imports
 */
const logger = require('./log')(module);

const explicitNLP = (() => {
  switch (process.env.NLP) {
    case 'corenlp':
      logger.info('Using CoreNLP');
      return require('./nlp-components/CoreNLP')({

      });
    case 'germaner':
      logger.info('Using GermaNER');
      return require('./nlp-components/GermaNER')({

      });
      case 'ctakes':
      logger.info('Using CtakesNLP1234');
      return require('./nlp-components/CtakesNLP');
    case 'stupid':
    default:
      logger.info('Using StupidNLP');
      return require('./nlp-components/StupidNLP');
  }
})();

/**
 *
 * @param callback
 */
module.exports.init = function(callback) {
  return explicitNLP.init(callback);
};

/**
 *
 * @param text
 * @param callbackIter = function(err, analysis)
 */
module.exports.analyze = function(text, contentType, source, callback) {
  return explicitNLP.analyze(text, contentType, source, callback);
};

/**
 *
 * @param analysis
 * @param callbackStart = function(err)
 * @param callbackIter = function(err, entities)
 * @param callbackDone = function(err)
 */
module.exports.findNamedEntities = function(analysis, callbackStart, callbackIter, callbackDone) {
  return explicitNLP.findNamedEntities(analysis, callbackStart, callbackIter, callbackDone);
};


