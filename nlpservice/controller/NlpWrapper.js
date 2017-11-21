'use strict';

const logger = require('./log')
  , stupidNER = require('./nlp-components/StupidNER')
  , corenlp = require('./nlp-components/CoreNLP')({

  })
  , germaner = require('./nlp-components/GermaNER')({

  })
// , async = require('async')
  ;


module.exports = {
  analyze : analyze
}

const explicitNLP = () => {
  switch(process.env.NER){
    case 'corenlp':
      logger.info('Using CoreNLP');
      return corenlp;
    case 'germaner':
      logger.info('Using GermaNER');
      return germaner;
    case 'stupid':
    default:
      logger.info('Using StupidNER');
      return stupidNER;
}();


/**
 *
 * @param document
 * @param callbackIter = function(err, entities)
 * @param callbackDone = function(err)
 */
function analyze(params) {
  return explicitNLP(params);
}

