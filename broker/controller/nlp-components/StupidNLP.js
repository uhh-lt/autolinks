'use strict';

const
  Offset = require('../../model/Offset').model,
  DOffset = require('../../model/DOffset').model,
  Annotation = require('../../model/Annotation').model,
  Analysis = require('../../model/Analysis').model,
  utils = require('../utils/utils'),
  logger = require('../log')(module);

const label = utils.getLabel(__filename);

module.exports = {

  init : function(callback) {
    /* nothing to do */
    callback(null);
  },

  /**
   *
   * Returns capitalized words as entities.
   *
   * @param analysis
   * @param callbackStart
   * @param callbackIter
   * @param callbackDone
   *
   */
  findNamedEntities : function(analysis, callbackStart, callbackIter, callbackDone) {

    logger.debug(`Analyzing document: '${analysis.source}'.`);

    // report that we'll start returning entities now
    callbackStart();

    let matchResult; // this will be updated with the current match
    const r = /\b/g; // look simply for word boundaries

    while ( (matchResult = r.exec(analysis.text)) ) { // while we have start of a word

      const offset_start = matchResult.index;
      r.lastIndex = r.lastIndex + 1; // search for the end of the word from index+1
      matchResult = r.exec(analysis.text); // find the end of the word
      const offset_end = matchResult.index;
      const word = analysis.text.substring(offset_start, offset_end);

      logger.debug(`Found a word: '${offset_start}:${offset_end}:${word}'.`);

      if (/^[A-ZÄÖÜ]/.test(word)) { // first char is uppercase
        // ahhh, even a blind chicken finds an entity
        const anno = new Annotation();
        anno.analyzer = label;
        anno.type = 'NamedEntity';
        anno.doffset.offsets.push(new Offset(offset_start, offset_end - offset_start));
        anno.properties.surface = word;
        anno.properties.type = 'UNK';
        logger.debug(`Found an entity: '${offset_start}:${offset_end}:${word}'.`, anno);
        // return the entity
        callbackIter(null, anno);
      }
      r.lastIndex = r.lastIndex + 1; // search for the start of the next word from index+1
    }

    // report that we're done
    callbackDone();

  },

  /**
   *
   * Returns sentences which end with {.?!} followed by a space character.
   *
   * @param analysis
   * @param callbackStart
   * @param callbackIter
   * @param callbackDone
   *
   */
  getSentences : function(analysis, callbackStart, callbackIter, callbackDone) {

    logger.debug(`Analyzing document: '${analysis.source}'.`);

    // report that we'll start returning entities now
    callbackStart();

    let offset_start = 0; // this will the begin of a sentence
    let matchResult; // this will be updated with the current match
    const r = /[.?!]+((\s+)|($))/g; // look simply for one of the standard sentence boundaries {.?!} followed by a empty space

    while ( (matchResult = r.exec(analysis.text)) ) { // while we have the end of a sentence
      const boundary = matchResult[0];
      const offset_end = matchResult.index + boundary.trim().length;
      const sentence = analysis.text.substring(offset_start, offset_end);
      const anno = new Annotation();
      anno.analyzer = label;
      anno.type = 'Sentence';
      anno.doffset.offsets.push(new Offset(offset_start, offset_end));
      anno.properties.surface = sentence;
      anno.properties.type = 'UNK';
      logger.debug(`Found a sentence: '${offset_start}:${offset_end}:${sentence}'.`, anno);
      // return the sentence
      callbackIter(null, anno);
      offset_start = matchResult.index + boundary.length; // continue searching for the next end of a sentence from the found match begin index + its length
      // r.lastIndex = offset_start;
    }

    // report that we're done
    callbackDone();

  },

  analyze : function(text, contentType, source, callback) {
    const ana = new Analysis();
    ana.text = text;
    ana.source = source;
    logger.info({text: text, contentType: contentType, source: source});

    // currently ignores errors completely
    this.getSentences(ana, () => {}, (err, anno) => {ana.annotations.push(anno);}, () => {});
    this.findNamedEntities(ana, () => {}, (err, anno) => {ana.annotations.push(anno);}, () => {});

    callback(null, ana);
  }

};