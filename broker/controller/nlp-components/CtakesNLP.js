'use strict';

const
  Offset = require('../../model/Offset').model,
  Annotation = require('../../model/Annotation').model,
  Analysis = require('../../model/Analysis').model,
  utils = require('../utils/utils'),
  logger = require('../log')(module),
  request = require('request-promise-native');

const label = utils.getLabel(__filename);

module.exports.init = function(callback) {
  /* TODO: run an initial query */
  callback(null);
};

module.exports.analyze = function(text, contentType, source) {
  const ana = new Analysis();
  ana.text = text;
  ana.source = source;
  logger.debug(`Analyzing document: '${ana.source}'.`);
  let options = {
    uri: process.env.CTAKESURL + '/analyse',
    method: 'POST',
    json: {
      "query": ana.text
    }
  };

  logger.info(`Using ctakes webservice: '${options.uri}'.`);

  return request(options)
    .then(function (parsedBody) {
      // POST succeeded...
      if(parsedBody.annotations !== null) {
        parsedBody.annotations.forEach(function(element) {
          let anno = new Annotation();
          anno.analyzer = label;
          anno.type = element.type;
          anno.doffset.offsets.push(new Offset(element.offset.from, element.offset.to - element.offset.from));
          anno.properties = {};
          element.properties.forEach(prop => anno.properties[prop.name] = prop.value);
          ana.annotations.push(anno);
        });
      }
      return ana;
    });

};