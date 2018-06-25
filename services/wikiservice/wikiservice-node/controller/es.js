'use strict';

const
  //_ = require('lodash'),
  elasticsearch = require('elasticsearch'),
  Queryhandler = require('./Queryhandler'),
  Resource = require('../../../../broker/model/Resource').model,
  logger = require('../../../../broker/controller/log')(module);

const esIndices = {};

let esClient;

/**
 * init es client
 * @param callback = function(err)
 */
module.exports.init = function (callback) {

  const es_version = process.env.ELASTICSEARCH_VERSION || '5.5';
  const es_urls =  (process.env.ELASTICSEARCH_URLS || 'http://elasticsearch:9200').split(/,/);
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);
  logger.info(`Using the follwing elasticsearch version: '${es_version}'`);


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

  (process.env.ELASTICSEARCH_INDICES || '')
    .split(/,/)
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .forEach(x => esIndices[x] = Queryhandler(x, esClient));
  logger.info(`Using the follwing elasticsearch indices: '${JSON.stringify(Object.keys(esIndices))}'`);

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
      return this.query(esindex, text);
    })).then(indexresources => {
      return new Resource(null, indexresources, null, { label : "wikimedia resources" });
    });
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
 */
module.exports.query = function(esindex, text){
  return esIndices[esindex].getResults(text);
};