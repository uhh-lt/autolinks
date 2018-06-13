'use strict';

const
  //_ = require('lodash'),
  elasticsearch = require('elasticsearch'),
  Querybuilder = require('./querybuilder'),
  Resource = require('../../../../broker/model/Resource').model,
  logger = require('../../../../broker/controller/log')(module);

const esIndices = {};

let esClient;

/**
 * init es client
 * @param callback = function(err)
 */
module.exports.init = function (callback) {

  const es_urls =  (process.env.ELASTICSEARCH_URLS || 'http://elasticsearch:9200').split(/,/);
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  const es_version = process.env.ELASTICSEARCH_VERSION || '5.5';
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  (process.env.ELASTICSEARCH_INDICES || '')
    .split(/,/)
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .forEach(x => esIndices[x] = Querybuilder(x));
  logger.info(`Using the follwing elasticsearch indices: '${JSON.stringify(Object.keys(esIndices))}'`);

  try {
    esClient = new elasticsearch.Client({
      hosts: es_urls,
      apiVersion: es_version,
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
 * Perform a query for each index and return the results as a ListResource
 *
 * @param text
 * @return {Promise} of a Resource
 */
module.exports.search = function(text) {
  return Promise.all(
    Object.keys(esIndices).map(esindex => {
      return this.query(esindex, text, 0, 1)
        .then(esresult => this.transformSearchResult(esindex, text, esresult));
    })).then(indexresources => {
      indexresources.push(new Resource (null, text));
      return new Resource(null, indexresources);
    });
};

module.exports.transformSearchResult = function(esindex, text, esresult) {
  return Promise.all(
    esresult.hits.hits.map((hit, i) => this.transformHit(esindex, text, hit, i+1))
  ).then(
    hitresources => new Resource(null, hitresources, null, { label: esindex, totalhits: esresult.hits.total })
  );
};

module.exports.transformHit = function(esindex, text, hit, i) {
  return Promise.resolve(hit)
    .then(hit => esIndices[esindex].transformHit(text, hit, i));
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
 * @param esindex
 * @param text
 * @param offset from
 * @param limit limit
 */
module.exports.query = function(esindex, text, offset, limit){
  // build the query
  const query = esIndices[esindex](text, offset, limit);
  logger.debug('Query: ', query);

  return esClient.search({
    index: esindex,
    body: query
  }).then(
    result => {
      logger.debug(`Found ${result.hits.total} hits for '${esindex}' at offset ${offset}. Limiting results to ${limit} hit(s).`);
      return result;
    }
  );
};