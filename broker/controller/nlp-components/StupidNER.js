'use strict';

const logger = require('../../controller/log')(module)
  , utils = require('./utils');

const label = utils.getLabel(__filename);

module.exports = {

  /**
   *
   * Returns capitalized words as entities.
   *
   * @param document
   * @param callbackStart
   * @param callbackIter
   * @param callbackDone
   *
   */
  analyze : function(document, callbackStart, callbackIter, callbackDone) {

    logger.debug(`Analyzing document: '${document.source}'.`, document);

    // report that we'll start returning entities now
    callbackStart(null);

    let matchResult; // this will be updated with the current match
    const r = /\b/g; // look simply for word boundaries

    while(matchResult = r.exec(document.text)){ // while we have start of a word

      const offset_start = matchResult.index;
      r.lastIndex = r.lastIndex + 1; // search for the end of the word from index+1
      matchResult = r.exec(document.text); // find the end of the word
      const offset_end = matchResult.index;
      const word = document.text.substring(offset_start, offset_end);

      logger.debug(`Found a word: '${offset_start}:${offset_end}:${word}'.`);

      if (/^[A-ZÄÖÜ]/.test(word)) { // first char is uppercase
        // ahhh, even a blind chicken finds an entity
        const entity = {
          analyzer: label,
          text: word,
          type: 'UNK', /* the type of the entity is unknown of course, because this is a stupid NER*/
          offset: {
            from: offset_start,
            to: offset_end,
          }
        };
        logger.debug(`Found an entity: '${offset_start}:${offset_end}:${word}'.`, entity);
        // return the entity
        callbackIter(null, entity);
      }
      r.lastIndex = r.lastIndex + 1; // search for the start of the next word from index+1
    }

    // report that we're done
    callbackDone(null);

  }

};