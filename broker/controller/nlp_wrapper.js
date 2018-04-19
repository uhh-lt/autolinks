'use strict';

/**
 * imports
 */
const
  Exception = require('../model/Exception').model,
  store = require('./storage_wrapper'),
  utils = require('./utils/utils'),
  analysis = require('../model/Analysis'),
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
      logger.info('Using CtakesNLP');
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
 */
module.exports.analyze = function(text, contentType, source) {
  return explicitNLP.analyze(text, contentType, source);
};

module.exports.analyzeDocument = function(uid, did, refresh) {
  return store.promisedGetFile(uid, did, 'info')
    .then(docinfo => {
      if(docinfo.analyzed){
        if(!refresh){
          return store.promisedGetFile(uid, did, 'analysis');
        }
        logger.debug(`Document has already been analyzed. OVERWRITING!`);
      }
      return store.promisedGetFile(uid, did, 'content')
        .then(content => this.analyze(content, docinfo.mimetype, docinfo.name))
        .then(analysis => {
          store.updateDocumentAnalysis(uid, did, analysis);
          return analysis;
        });
    });
};

