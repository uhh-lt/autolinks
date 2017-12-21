'use strict';

const
  _ = require('lodash'),
  elasticsearch = require('elasticsearch'),
  Triple = require('../../../../broker/model/Triple'),
  logger = require('../../../../broker/controller/log')(module);

const esIndices = [];

let esClient;

/**
 * init es client
 * @param callback = function(err)
 */
module.exports.init = function (callback) {

  const es_urls =  (process.env.ELASTICSEARCH_URLS || 'http://elasticsearch:9200').split(/,/);
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  (process.env.ELASTICSEARCH_INDICES || '')
    .split(/,/)
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .forEach(x => esIndices.push(x));
  logger.info(`Using the follwing elasticsearch indices: '${JSON.stringify(esIndices)}'`);

  try {
    esClient = new elasticsearch.Client({
      hosts: es_urls,
      apiVersion: '5.5',
      // sniffOnStart: true,
      // sniffInterval: 20000,
    });
  } catch(err){
    return callback(err);
  }

  callback(null);

};

/**
 *
 * @param callback
 */
module.exports.findWikiIndices = function(callback) {
  // _cat/indices?index=*wik*
  callback(new Error('NOT YET IMPLEMENTED'));
};

/**
 *
 * @param callback = function(err)
 */
module.exports.ping = function(callback){
  esClient.ping({
    requestTimeout: 30000,
  }, callback);
};

/**
 *
 * @param text
 * @param callback
 * @param callbackDone
 */
module.exports.search = function(text, callback, callbackDone) {
  // const query = { query_string: { query: `title:"${text}"` } };
  const query = { term : { title : text } };
  // _(esIndices)
  //   .forEach(index => this.query(index, query, 0, 1, callback));
    // .done(() => callbackDone(null));
  // TODO: this currently only queries the first index in the list
  this.query(esIndices[0], query, 0, 1, callback, callbackDone);
};

module.exports.transformSearchResults = function(text, searchResult){
  // for each hit create a triple
  return _(searchResult.hits.hits)
    .map(h =>
      new Triple(
        text,
        [
          new Triple (
            'appears_in',
            'has_score',
            h._score
          )
        ],
        [
          new Triple(
            h._id,
            'has_title',
            h._source.title
          )
        ].concat(
          _(h._source.category).map(c =>
            new Triple(
              h._id,
              'has_category',
              c
            )
          ).value()
        ).concat(
          _(h._source.redirects).map(r =>
            new Triple(
              h._id,
              'has_redirect',
              r.title
            )
          ).value()
        )
      )
    ).value();
};

/**
 *
 * @param callback = function(err)
 */
module.exports.close = function(callback){
  esClient.close();
  callback(null);
};

/**
 *
 * @param index
 * @param type
 * @param id
 * @param callback
 */
module.exports.get = function(index, type, id, callback){
  esClient.get({
    index: index,
    type: type,
    id: id
  }, callback);
};


/**
 * @param index
 * @param query
 * @param callback
 */
module.exports.query = function(index, query, offset, limitResults, callback, callbackDone){
  const queryBody = {
    query : query,
    from : offset,
    size : limitResults,
    _source: ['title', 'category']
  };
  logger.debug('Query: ', queryBody);

  esClient.search({
    index: index,
    body: queryBody
  }).then(
    result => {
      logger.debug(`Found ${result.hits.total} hits.`);
      callback(null, result);
    },
    err => callback(err, null)

  ).then(
    result => callbackDone(null, result),
    err => callbackDone(err, null)
  );
};