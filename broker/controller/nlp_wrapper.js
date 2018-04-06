'use strict';

/**
 * imports
 */
const
  Exception = require('../model/Exception').model,
  logger = require('./log')(module);

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
module.exports.analyze = function(text, contentType, source) {
  return explicitNLP.analyze(text, contentType, source);
};


module.exports.analyzeDocument = function(uid, did, refresh) {

  return Promise.reject(new Exception('NotImplemented', 'Method not yet implemented.'));
};





