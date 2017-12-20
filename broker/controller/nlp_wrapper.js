'use strict';

/**
 * imports
 */
const logger = require('./log')(module);

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


