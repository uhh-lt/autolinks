'use strict';

const
  elasticsearch = require('elasticsearch'),
  logger = require('../../../../broker/controller/log')(module);

const wiki_indices = [
  // 'enwiki',
  // 'wikidata',
  // 'wiktionary',
  'simplewiki',
];

let esclient;

/**
 * init es client
 * @param callback = function(err)
 */
module.exports.init = function (callback) {

  const es_urls =  (process.env.ELASTICSEARCH_URLS || 'http://elasticsearch:9200').split(/,/);
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  try {
    esclient = new elasticsearch.Client({
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
  esclient.ping({
    requestTimeout: 30000,
  }, callback);
};

/**
 *
 * @param text
 * @param callback
 * @param callbackDone
 */
module.exports.search = function(text, callback, callbackDone){
  const query = {
    match: {
      title: text
    }
  };
  wiki_indices.forEach(index => this.query(index, query, callback));
  callbackDone(null);
};

/**
 *
 * @param callback = function(err)
 */
module.exports.close = function(callback){
  esclient.close();
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
  esclient.get({
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
module.exports.query = function(index, query, callback){
  console.log(query);
  esclient.search({
    index: index,
    body: {
      query : query
    }
  }).then(
    result => callback(null, result),
    err => callback(err, null)
  );
};